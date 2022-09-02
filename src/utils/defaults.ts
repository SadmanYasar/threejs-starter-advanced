import { GridHelperParamsTypes, SettingsType } from "../types";
import { SettingManager } from "./helper";

export const GridHelperParams: GridHelperParamsTypes = {
    size: 10,
    divisions: 10
};

const result = SettingManager.get();
export const Settings: SettingsType = result ? result : {
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