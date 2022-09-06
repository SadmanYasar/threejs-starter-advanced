import { GridHelperParamsTypes, SettingsType } from "../types";

export const GridHelperParams: GridHelperParamsTypes = {
    size: 10,
    divisions: 10
};

export const Settings: SettingsType = {
    debug: true,
    camera: {
        pos: {
            x: 0,
            y: 0,
            z: 4,
        },
        fov: 90,
        near: 0.8,
        far: 500,
    }
};