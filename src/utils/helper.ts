import { DirectionalLight, HemisphereLight, Mesh, PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { Settings, update } from "./defaults";
import { SettingsType } from "../types/index";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { GUI } from "dat.gui";

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

const handleChange = () => update.needsUpdate = update.needsUpdate === false ? true : true;

interface initGuiProps {
    folderName: string;
    gui: GUI;
    object: PerspectiveCamera | HemisphereLight | DirectionalLight | Mesh;
    scale?: boolean;
}
const initGui = ({ folderName, gui, object, scale }: initGuiProps) => {
    const folder = gui.addFolder(folderName);

    const pos = folder.addFolder('Position');

    pos.add(object.position, 'x', -10, 10).name('pos-x').onChange(handleChange).listen();
    pos.add(object.position, 'y', -10, 10).name('pos-y').onChange(handleChange).listen();
    pos.add(object.position, 'z', -10, 10).name('pos-z').onChange(handleChange).listen();

    const rotate = folder.addFolder('Rotation');

    rotate.add(object.rotation, 'x', 0, Math.PI * 2).onChange(handleChange).listen();
    rotate.add(object.rotation, 'y', 0, Math.PI * 2).onChange(handleChange).listen();
    rotate.add(object.rotation, 'z', 0, Math.PI * 2).onChange(handleChange).listen();

    if (scale) {
        const scaleFolder = folder.addFolder('Scale');

        scaleFolder.add(object.scale, 'x', 1, 10, 1).onChange(handleChange).listen();
        scaleFolder.add(object.scale, 'y', 1, 10, 1).onChange(handleChange).listen();
        scaleFolder.add(object.scale, 'z', 1, 10, 1).onChange(handleChange).listen();
    }

    folder.add(object, 'visible');
};

export default {
    onWindowResize,
    resetCam,
    generateSettings,
    setEditorToMain,
    handleChange,
    initGui
};

