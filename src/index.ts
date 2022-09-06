import './styles/style.css';
import {
    AxesHelper,
    BoxGeometry,
    CameraHelper,
    GridHelper,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Settings } from './utils/defaults';
import Stats from 'three/examples/jsm/libs/stats.module';
import { generateSettings, resetCam } from './utils/helper';

const contendor = document.body;
const { x, y, z } = Settings.camera.pos;
const { fov, near, far } = Settings.camera;

const scene = new Scene();

const onWindowResize = () => {
    currentCamera.aspect = contendor.clientWidth / contendor.clientHeight;

    currentCamera.updateProjectionMatrix();

    renderer.setSize(contendor.clientWidth, contendor.clientHeight);
};
window.addEventListener('resize', onWindowResize, false);

export const mainCamera = new PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
mainCamera.position.set(x, y, z);
let currentCamera: PerspectiveCamera = mainCamera;

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(currentCamera, renderer.domElement);

const geometry = new BoxGeometry();
const material = new MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
});

const cube = new Mesh(geometry, material);
scene.add(cube);

//controls.update() must be called after any manual changes to the camera's transform
controls.update();

// creates a canvas on container div
contendor.appendChild(renderer.domElement);

/*
============================
GUI

For prod, set debug to false
in settings.json
============================
*/
let stats: Stats;
let editorCamera: PerspectiveCamera;
let editorCameraHelper: CameraHelper;
let needsUpdate = false;
if (Settings.debug === true) {
    const element = document.createElement('div');
    element.innerText = 'Debug mode - Main View';
    element.style.cssText = `
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        z-index: 2;
        color: yellow;
    `;
    document.body.appendChild(element);

    void (async () => {
        console.log({ ...Settings });

        try {
            const { GUI } = await import('dat.gui');
            const { GridHelperParams } = await import('./utils/defaults');
            const { TransformControls } = await import('three/examples/jsm/controls/TransformControls');

            const axesHelper = new AxesHelper(10);
            scene.add(axesHelper);
            stats = Stats();
            document.body.appendChild(stats.dom);

            const gridHelper = new GridHelper(GridHelperParams.size, GridHelperParams.divisions);
            let tempSize: number = GridHelperParams.size;
            scene.add(gridHelper);

            editorCamera = new PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
            editorCamera.position.set(x, y, z);
            editorCameraHelper = new CameraHelper(editorCamera);
            scene.add(editorCameraHelper);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const transformControls = new TransformControls(mainCamera, renderer.domElement);
            transformControls.attach(cube);
            scene.add(transformControls);
            transformControls.enabled = false;

            const gui = new GUI();
            gui.addFolder('Settings');
            const gridFolder = gui.addFolder('Grid');
            gridFolder.add(GridHelperParams, 'size', 1, 10, 1).onFinishChange(() => {
                const size = GridHelperParams.size;

                if (tempSize !== size) {
                    gridHelper.scale.setScalar(size / 10);
                    tempSize = size / 10;
                }
            });
            // gridFolder.add(GridHelperParams, 'divisions', 1, 10, 1);

            const cubeFolder = gui.addFolder('Cube');
            const cubeRotateFolder = cubeFolder.addFolder('Position');
            cubeRotateFolder.add(cube.position, 'x', 0, 100).listen();
            cubeRotateFolder.add(cube.position, 'y', 0, 100).listen();
            cubeRotateFolder.add(cube.position, 'z', 0, 100).listen();
            cubeRotateFolder.open();

            // editor cam functions for debugging
            let camType = 'Editor';
            const cam = {
                resetAll: () => {
                    resetCam();

                    editorCamera.position.set(x, y, z);
                    editorCamera.fov = fov;
                    editorCamera.near = near;
                    editorCamera.far = far;
                    editorCamera.lookAt(0, 0, 0);
                    editorCamera.updateMatrixWorld();
                    currentCamera.updateProjectionMatrix();
                },
                setEditorToMain: () => {
                    const { x, y, z } = mainCamera.position;
                    editorCamera.position.set(x, y, z);
                    editorCamera.lookAt(0, 0, 0);
                    editorCamera.updateMatrixWorld();
                },
                toggleCam: () => {
                    const changeTo = currentCamera === mainCamera ? editorCamera : mainCamera;
                    controls.object = changeTo;
                    controls.enabled = changeTo === mainCamera ? true : false;
                    currentCamera = changeTo;
                    renderer.render(scene, currentCamera);

                    element.innerText = `Debug Mode - ${camType} View`;
                    camType = camType === 'Editor' ? 'Main' : 'Editor';

                    onWindowResize();
                },
                generateSettings: () => {
                    console.log(JSON.stringify(generateSettings({
                        debug: true,
                        camera: editorCamera
                    }), null, 4));
                }
            };

            cam.resetAll();
            const cameraFolder = gui.addFolder('Camera');

            const handleChange = () => needsUpdate = needsUpdate === false ? true : true;
            cameraFolder.add(editorCamera.position, 'x', -100, 100, 1).name('pos-x').onChange(handleChange);
            cameraFolder.add(editorCamera.position, 'y', -100, 100, 1).name('pos-y').onChange(handleChange);
            cameraFolder.add(editorCamera.position, 'z', -100, 100, 1).name('pos-z').onChange(handleChange);
            cameraFolder.add(editorCamera, 'fov', 60, 100).onChange(handleChange);
            cameraFolder.add(editorCamera, 'near', 0, 1, 0.1).onChange(handleChange);
            cameraFolder.add(editorCamera, 'far', 0, 500, 10).onChange(handleChange);
            cameraFolder.add(cam, 'resetAll').name('Reset All Camera (R)');
            cameraFolder.add(cam, 'setEditorToMain').name('Set Editor Camera To Main (S)');

            cameraFolder.add(cam, 'toggleCam').name(`Toggle Camera (T)`);
            cameraFolder.add(cam, 'generateSettings').name(`Generate Settings`);
            cameraFolder.open();

            window.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'r':
                        cam.resetAll();
                        break;

                    case 't':
                        cam.toggleCam();
                        break;

                    case 's':
                        cam.setEditorToMain();
                        break;

                    case 'e':
                        controls.enabled = !controls.enabled;
                        transformControls.enabled = !controls.enabled;
                        break;

                    default:
                        break;
                }
            });
        } catch (error) {
            console.log('failed to load debug :(');
        }
    })();
}

const animate = () => {
    controls.update();
    renderer.render(scene, currentCamera);

    if (Settings.debug === true) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        stats?.update();

        if (needsUpdate === true) {
            editorCamera?.updateMatrixWorld();
            editorCamera?.updateProjectionMatrix();
            editorCameraHelper?.update();
            needsUpdate = false;
        }
    }

    window.requestAnimationFrame(animate);
};

animate();