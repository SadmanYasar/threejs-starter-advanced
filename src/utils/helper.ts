import { PerspectiveCamera, Vector3 } from "three";

export const setCameraToVector = (camera: PerspectiveCamera, vector: Vector3): void => {
    camera.position.set(vector.x, vector.y, vector.z);
};