import { env } from "@/lib/env";

export function getCloudinaryUrl(publicId: string, width?: number): string {
  const transform = width ? `w_${width},c_limit,f_auto,q_auto` : "f_auto,q_auto";
  return `https://res.cloudinary.com/${env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}
