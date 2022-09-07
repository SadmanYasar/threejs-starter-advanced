import { PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { Settings } from "./defaults";
import { SettingsType } from "../types/index";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

interface onWindowResizeProps {
    currentCamera: PerspectiveCamera;
    contendor: HTMLElement;
    renderer: WebGLRenderer;
}
const onWindowResize = ({ contendor, currentCamera, renderer }: onWindowResizeProps) => {
    currentCamera.aspect = contendor.clientWidth / contendor.clientHeight;

    currentCamera.updateProjectionMatrix();

    renderer.setSize(contendor.clientWidth, contendor.clientHeight);
};

interface resetCamProps {
    mainCamera: PerspectiveCamera;
    editorCamera: PerspectiveCamera;
    controls: OrbitControls;
    transformControls: TransformControls;
}
const resetCam = ({
    mainCamera,
    editorCamera,
    controls,
    transformControls }: resetCamProps): void => {
    const { x, y, z } = Settings.camera.pos;
    const { fov, near, far } = Settings.camera;
    mainCamera.position.set(x, y, z);
    mainCamera.fov = fov;
    mainCamera.near = near;
    mainCamera.far = far;

    controls.object = mainCamera;
    controls.enabled = true;
    transformControls.enabled = false;
    editorCamera.position.set(x, y, z);
    editorCamera.fov = fov;
    editorCamera.near = near;
    editorCamera.far = far;
    editorCamera.lookAt(0, 0, 0);
    editorCamera.updateMatrixWorld();
    mainCamera.updateProjectionMatrix();
};

interface setEditorToMainProps {
    mainCameraPos: Vector3;
    editorCamera: PerspectiveCamera;
}
const setEditorToMain = ({ mainCameraPos, editorCamera }: setEditorToMainProps) => {
    const { x, y, z } = mainCameraPos;
    editorCamera.position.set(x, y, z);
    editorCamera.lookAt(0, 0, 0);
    editorCamera.updateMatrixWorld();
};

// Might implement later
/* interface SettingManagerTypes {
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
}; */

interface generateSettingsProps {
    debug: boolean;
    camera: PerspectiveCamera;
    //light: light
}
const generateSettings = ({
    debug,
    camera,
}: generateSettingsProps): SettingsType => {
    const { x, y, z } = camera.position;
    const { fov, near, far } = camera;

    return {
        debug,
        camera: {
            pos: {
                x, y, z
            },
            fov,
            near,
            far
        }
    };
};

export default {
    onWindowResize,
    resetCam,
    generateSettings,
    setEditorToMain,
};
