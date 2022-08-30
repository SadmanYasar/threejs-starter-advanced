import { PerspectiveCamera, Vector3 } from "three";
import fs from 'fs';
import { SettingsType } from "../types";

export const setCameraToVector = (camera: PerspectiveCamera, vector: Vector3): void => {
    camera.position.set(vector.x, vector.y, vector.z);
};

interface updateFileParamTypes {
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
};