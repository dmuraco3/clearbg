"use client";

import * as tf from "@tensorflow/tfjs";

import { SegformerForSemanticSegmentation, Tensor } from "@xenova/transformers";

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if(reader.result) {
            var base64Parts = reader.result.toString().split(",");
            var fileFormat = base64Parts[0].split(";")[1];
            var fileContent = base64Parts[1];
            const out = `data:image/png;base64,${fileContent}`
            resolve(out);
        }else{reject("reader didn't return a result")};
    }
    reader.onerror = reject;
});

export const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.src = url;
        im.onload = () => resolve(im);
        im.onerror = () => reject(`couldn't load image with src: ${url}`);
    });
};

async function preprocess_image(image: tf.Tensor3D, model_input_size: [number, number]) {
    const tensor = image.toFloat();
    const resized = tf.image.resizeBilinear(tensor, model_input_size);
    const normalized = tf.div(resized, 255.0);
    const standardized = tf.sub(normalized, [0.5, 0.5, 0.5]).div([1.0, 1.0, 1.0]);

    const expanded = tf.transpose(standardized, [2, 0, 1]).expandDims(0);
    return expanded;
}

function post_process_image(result: Tensor, original_image: tf.Tensor3D, original_size: [number, number]) {
    const tf_tensor = tf.tensor(result.tolist(), result.dims, "float32");
    const transposed = tf.transpose(tf_tensor, [0, 2, 3, 1]);
    const resized = tf.image.resizeBilinear(transposed as tf.Tensor4D, original_size)
    const squeezed = resized.squeeze([0, 3]);
    const expanded_mask = squeezed.expandDims(-1).tile([1, 1, 3]);
    const inverted_mask = tf.scalar(1).sub(expanded_mask);

    const white_masked_image = original_image.mul(expanded_mask).add(inverted_mask.mul(255));

    const min = white_masked_image.min();
    const max = white_masked_image.max();
    const normalized = white_masked_image.sub(min).div(max.sub(min));

    const uint8Image = tf.mul(normalized, 255).toInt();
    return uint8Image;
}

export default async function removeBackground(image_b64: string): Promise<string> {
    console.log("got image not doing magic");
    const img = await loadImage(image_b64);
    console.log("crafting image now");
    const tensor = tf.browser.fromPixels(img);

    let pre_tf_tensor = await preprocess_image(tensor, [1024, 1024]);
    let pre_tr_tensor = new Tensor("float32", await pre_tf_tensor.data(), pre_tf_tensor.shape);

    let model = await SegformerForSemanticSegmentation.from_pretrained("briaai/RMBG-1.4");

    console.log("feeding image into model");
    let { output } = await model({ input: pre_tr_tensor });
    console.log("prediction complete, now prettying");

    const masked = post_process_image(output, tensor, [img.height, img.width]);

    const masked_buffer = await tf.browser.toPixels(masked as tf.Tensor3D);
    const masked_b64 = Buffer.from(masked_buffer).toString("base64");

    return masked_b64;
}
