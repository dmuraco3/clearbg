"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useState } from "react";

const HeroSection: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const router = useRouter();

    const saveImageToLocalStorage = (image: File) => {
        const reader = new FileReader();
        reader.onload = (b64) => {
            if(reader.result) localStorage.setItem("user_image", reader.result.toString());
        };
        reader.readAsDataURL(image);
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            saveImageToLocalStorage(file);
            router.push("/upload?ref=with_image")
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            setSelectedImage(file);
            saveImageToLocalStorage(file);
            router.push("/upload?ref=with_image")

        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <section className="container mx-auto grid lg:grid-cols-2 lg:gap-x-8">
            {/* BEGIN HERO IMAGE CONTAINER */}
            <div className="w-full aspect-auto">
                <Image src="https://picsum.photos/400/600" alt="Example Image" width={400} height={600} style={{ objectFit: "cover", objectPosition: "center" }} />
            </div>
            {/* END HERO IMAGE CONTAINER */}

            {/* BEGIN IMAGE PICKER SECTION */}
            <div className="flex flex-col gap-y-3">
                <h1>Upload an Image to Remove the Background for Free</h1>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <div
                    className="border-2 border-dashed border-gray-300 p-4"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <p>Drag and drop an image here</p>
                </div>
            </div>
            {/* END IMAGE PICKER SECTION */}
        </section>
    );
};

export default HeroSection;