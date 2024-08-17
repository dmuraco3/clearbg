"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import removeBackground, { loadImage } from "../utils/removeBg";
import Image from "next/image";


export default function Upload() {
    const [image, setImage] = useState<string>();
    const [maskedImage, setMaskedImage] = useState<string>();
    const [processingImage, setProcessingImage] = useState(false);
    const searchParams = useSearchParams();

    const [ready, setReady] = useState(false);

    const worker = useRef<Worker | null>(null);

    useEffect(() => {
        const ref = searchParams.get("ref");

        if (ref !== "with_image") return;
        var base64 = localStorage.getItem("user_image");
        if (!base64) return;

        setImage(base64)

        if (!worker.current) {
            worker.current = new Worker(new URL('./worker.ts', import.meta.url), { type: "module" });
            const onMessageRecieved = (e: MessageEvent<any>) => {
                if(e.data.status==="initiate")setReady(false);
                else if(e.data.status==="ready")setReady(true);
                else if(e.data.status==="complete"){
                    const img_data = e.data.output as Uint8ClampedArray;
                    const img_src = window.URL.createObjectURL(
                        new Blob([img_data.buffer], {type: "image/jpg"})
                    );
                    setMaskedImage(img_src);
                }
            }
            worker.current.addEventListener('message', onMessageRecieved);
    
            
            loadImage(base64).then((img) => {
                let canvas = new OffscreenCanvas(img.width, img.height);
                let context = canvas.getContext("2d");
                context?.drawImage(img, 0,0);
                const data = context?.getImageData(0,0,img.width,img.height).data;
                if(data && worker.current) worker.current.postMessage({width:img.width, height:img.height, img_uint8:data});
            })
            return () => worker.current?.removeEventListener('message', onMessageRecieved);
        }
    });


    return <main className="container mx-auto">
        {image !== undefined ? <Image src={`${image}`} alt="user image" width={400} height={400} /> : <></>}
        {maskedImage !== undefined ? <Image src={`${maskedImage}`} alt="user image" width={400} height={400} unoptimized/> : <></>}
        {ready !== null && (
            <pre className="bg-gray-100 p-2 rounded">
                {
                    (!ready || !maskedImage) ? "Loading..." : "LOADEDLOADEDLOADED"
                }
            </pre>
        )}
    </main>
}