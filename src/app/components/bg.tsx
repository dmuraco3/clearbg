"use client";

import {ImageSegmentationPipelineOutput, pipeline, SegformerForSemanticSegmentation, Tensor} from "@xenova/transformers";
import { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

async function preprocess_image(image: tf.Tensor3D, model_input_size: [number, number]) {
    const tensor = image.toFloat();
    const resized = tf.image.resizeBilinear(tensor, model_input_size);
    const normalized = tf.div(resized, 255.0);
    const standardized = tf.sub(normalized,[0.5,0.5,0.5]).div([1.0,1.0,1.0]);

    const expanded = tf.transpose(standardized,[2,0,1]).expandDims(0);
    return expanded;
}

function post_process_image(result: Tensor, original_image: tf.Tensor3D, original_size: [number, number]) {
    const tf_tensor = tf.tensor(result.tolist(), result.dims, "float32");
    const transposed = tf.transpose(tf_tensor, [0,2,3,1]);
    const resized = tf.image.resizeBilinear(transposed as tf.Tensor4D, original_size)
    const squeezed = resized.squeeze([0,3]);
    const expanded_mask = squeezed.expandDims(-1).tile([1,1,3]);
    const inverted_mask = tf.scalar(1).sub(expanded_mask);
    
    const white_masked_image = original_image.mul(expanded_mask).add(inverted_mask.mul(255));

    const min = white_masked_image.min();
    const max = white_masked_image.max();
    const normalized = white_masked_image.sub(min).div(max.sub(min));

    const uint8Image = tf.mul(normalized, 255).toInt();
    return uint8Image;

}

const BG: React.FC = () => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const originalCanvasRef = useRef<HTMLCanvasElement|null>(null);

    let image_path = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    const clickHandler = () => {
        (async()=> {
            const image = new Image();
            image.src = image_path;
            image.crossOrigin="anonymous";
            console.log("loading image");
            image.onload = async () => {
                console.log("loaded image, now pre-processing")
                const tensor = tf.browser.fromPixels(image);
                let pre_tf_tensor = await preprocess_image(tensor, [1024,1024]);
                let pre_tr_tensor = new Tensor("float32", await pre_tf_tensor.data(), pre_tf_tensor.shape);
    
                console.log("loading model");
                let model = await SegformerForSemanticSegmentation.from_pretrained("briaai/RMBG-1.4");
                model.caller

                console.log("pre-processed image and loaded model, now feeeding into model");
        
                let {output} = await model({input: pre_tr_tensor});

                const masked = post_process_image(output, tensor, [image.height, image.width]);

                if(canvasRef.current && originalCanvasRef.current) {
                    canvasRef.current.width = image.width;
                    originalCanvasRef.current.width=image.width;
                    canvasRef.current.height = image.height;
                    originalCanvasRef.current.height=image.height;
                    const context = canvasRef.current.getContext("2d");
                    if (context) {
                        const mask_pixels = await tf.browser.toPixels(masked as tf.Tensor3D)
                        context.putImageData(new ImageData(mask_pixels,image.width,image.height),0,0);
                        
                        await tf.browser.toPixels(tensor, originalCanvasRef.current);

                    }
                    console.log("drawn");
                };

                model.dispose()
            };
    
            return "";
        })();
    }

    return <div>
        <button onClick={()=>clickHandler()}>Do Work</button>
        <div className="flex justify-between">
            <canvas ref={canvasRef}/>
            <canvas ref={originalCanvasRef}/>

        </div>
    </div>
}; export default BG;