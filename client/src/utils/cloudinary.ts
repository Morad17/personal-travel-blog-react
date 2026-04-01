const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;

function buildUrl(publicId: string, transforms: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

function buildVideoUrl(publicId: string, transforms: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transforms}/${publicId}`;
}

export function thumbnail(publicId: string): string {
  return buildUrl(publicId, 'w_600,c_fill,q_auto,f_auto');
}

export function cardImage(publicId: string): string {
  return buildUrl(publicId, 'w_800,h_500,c_fill,q_auto,f_auto');
}

export function heroImage(publicId: string): string {
  return buildUrl(publicId, 'w_1920,c_fill,q_auto,f_auto');
}

export function fullImage(publicId: string): string {
  return buildUrl(publicId, 'q_auto,f_auto');
}

export function videoThumb(publicId: string): string {
  return buildVideoUrl(publicId, 'so_0,w_600,c_fill,q_auto,f_jpg');
}

export function avatar(publicId: string): string {
  return buildUrl(publicId, 'w_120,h_120,c_fill,g_face,r_max,q_auto,f_auto');
}
