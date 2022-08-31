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
import { resetCam } from './utils/helper';

const contendor = document.body;

// can only use this in a server
// search for settings.json
// if not found then create one with existing data from defaults
/* try {
    if (fs.existsSync('/settings.json')) {
        console.log('exists');
    }
} catch (error) {
    console.log('not exists');
} */

const scene = new Scene();

const onWindowResize = () => {
    currentCamera.aspect = contendor.clientWidth / contendor.clientHeight;

    currentCamera.updateProjectionMatrix();

    renderer.setSize(contendor.clientWidth, contendor.clientHeight);
};
window.addEventListener('resize', onWindowResize, false);

export const mainCamera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.8, 1000);
mainCamera.position.set(0, 0, 4);
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

            const editorCamera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.8, 1000);
            editorCamera.position.set(0, 0, 4);
            const editorCameraHelper = new CameraHelper(editorCamera);
            scene.add(editorCameraHelper);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const transformControls = new TransformControls(editorCamera, renderer.domElement);

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
            const cubeRotateFolder = cubeFolder.addFolder('Rotation');
            cubeRotateFolder.add(cube.rotation, 'x', 0, Math.PI * 2);
            cubeRotateFolder.add(cube.rotation, 'y', 0, Math.PI * 2);
            cubeRotateFolder.add(cube.rotation, 'z', 0, Math.PI * 2);
            cubeRotateFolder.open();

            // Camera editor
            // This is the one for main app
            const cam = {
                resetAll: () => {
                    resetCam();
                    const { x, y, z } = Settings.camera.pos;
                    const { fov, near, far } = Settings.camera;
                    editorCamera.position.set(x, y, z);
                    editorCamera.fov = fov;
                    editorCamera.near = near;
                    editorCamera.far = far;
                    editorCamera.lookAt(0, 0, 0);
                    editorCamera.updateMatrixWorld();
                },
                setEditorToMain: () => {
                    const { x, y, z } = mainCamera.position;
                    editorCamera.position.set(x, y, z);
                    editorCamera.lookAt(0, 0, 0);
                    editorCamera.updateMatrixWorld();
                }
            };
            const cameraFolder = gui.addFolder('Camera');

            cameraFolder.add(editorCamera.position, 'x', 0, 100).name('pos-x').listen();
            cameraFolder.add(editorCamera.position, 'y', 0, 100).name('pos-y').listen();
            cameraFolder.add(editorCamera.position, 'z', 0, 100).name('pos-z').listen();
            cameraFolder.add(editorCamera, 'fov', 60, 100).onChange(() => {
                editorCamera.updateProjectionMatrix();
                editorCameraHelper.update();
            }).listen();
            cameraFolder.add(editorCamera, 'near', 0, 1, 0.1).onChange(() => {
                editorCamera.updateProjectionMatrix();
                editorCameraHelper.update();
            }).listen();
            cameraFolder.add(editorCamera, 'far', 0, 1000, 10).onChange(() => {
                editorCamera.updateProjectionMatrix();
                editorCameraHelper.update();
            }).listen();
            cameraFolder.add(cam, 'resetAll').name('Reset All Camera');
            cameraFolder.add(cam, 'setEditorToMain').name('Set Editor Camera To Main');

            const currentCam = {
                cam: () => {
                    const changeTo = currentCamera === mainCamera ? editorCamera : mainCamera;
                    controls.object = changeTo;
                    transformControls.camera = changeTo;
                    currentCamera = changeTo;
                    renderer.render(scene, currentCamera);

                    onWindowResize();
                },
            };
            let camType = 'Editor';
            cameraFolder.add(currentCam, 'cam').name(`Toggle Camera`).onChange(() => {
                element.innerText = `Debug Mode - ${camType} View`;
                camType = camType === 'Editor' ? 'Main' : 'Editor';
            });
            cameraFolder.open();
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
    }

    window.requestAnimationFrame(animate);
};

animate();