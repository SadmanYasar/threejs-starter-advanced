import { mainCamera } from "..";
import { Settings } from "./defaults";

// need a backend server for this function
/* interface updateFileParamTypes {
    path: string;
    updatedSettings: SettingsType;
}
export const updateSettings = (props: updateFileParamTypes): void => {
    fs.writeFile(props.path, JSON.stringify(props.updatedSettings, null, 2), (e: unknown) => {
        if (e) {
            console.log(e);
        }

        console.log(JSON.stringify(props.updatedSettings, null, 2));
        console.log('writing to ' + props.path);
    });
}; */

export const resetCam = (): void => {
    const { x, y, z } = Settings.camera.pos;
    const { fov, near, far } = Settings.camera;
    mainCamera.position.set(x, y, z);
    mainCamera.fov = fov;
    mainCamera.near = near;
    mainCamera.far = far;
};