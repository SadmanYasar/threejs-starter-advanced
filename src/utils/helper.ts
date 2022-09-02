import { mainCamera } from "..";
import { SettingsType } from "../types";
import { Settings } from "./defaults";

export const resetCam = (): void => {
    const { x, y, z } = Settings.camera.pos;
    const { fov, near, far } = Settings.camera;
    mainCamera.position.set(x, y, z);
    mainCamera.fov = fov;
    mainCamera.near = near;
    mainCamera.far = far;
};

interface SettingManagerTypes {
    allSettings: SettingsType[];
    save: (currentSetting: SettingsType) => void;
    undo: () => void;
    get: () => SettingsType | null;
}

const settings: SettingsType[] = [Settings];
export const SettingManager: SettingManagerTypes= {
    allSettings: settings,
    save: (setting: SettingsType) => {
        if (settings.length > 10) {
            settings.shift();
        }

        settings.push(setting);
        window.localStorage.setItem('currentSetting', JSON.stringify(setting));
    },
    undo: () => {
        if (settings.length < 2) {
            console.log('no saves!');
            return;
        }
        settings.pop();
        window.localStorage.setItem('currentSetting', JSON.stringify(settings[settings.length - 1]));
    },
    get: () => {
        const setting = window.localStorage.getItem('currentSetting');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return setting ? JSON.parse(setting) : null;
    },
};
