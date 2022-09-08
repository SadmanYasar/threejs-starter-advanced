import './styles/style.css';
import {
    AxesHelper,
    BoxGeometry,
    CameraHelper,
    DirectionalLight,
    DirectionalLightHelper,
    GridHelper,
    HemisphereLight,
    HemisphereLightHelper,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Settings, update } from './utils/defaults';
import Stats from 'three/examples/jsm/libs/stats.module';
import helper from './utils/helper';

const contendor = document.body;
const { x, y, z } = Settings.camera.pos;
const { fov, near, far } = Settings.camera;

const scene = new Scene();

window.addEventListener('resize', () => {
    helper.onWindowResize({
        contendor, currentCamera, renderer
    });
}, false);

const mainCamera = new PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
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
cube.name = "Cube";
scene.add(cube);

//controls.update() must be called after any manual changes to the camera's transform
controls.update();

// creates a canvas on container div
contendor.appendChild(renderer.domElement);

// lights
const hemlight = new HemisphereLight(0xffffbb, 0x080820, 1);
const hemlightPos = { ...Settings.lights.hemlight.pos };
hemlight.position.set(hemlightPos.x, hemlightPos.y, hemlightPos.z);
scene.add(hemlight);

// White directional light at half intensity shining from the top.
const directionalLight = new DirectionalLight(0xffffff, 0.5);
const directionalLightPos = { ...Settings.lights.directionalLight.pos };
directionalLight.position.set(directionalLightPos.x, directionalLightPos.y, directionalLightPos.z);
scene.add(directionalLight);

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
            const { Group, Raycaster } = await import('three');
            const helperGroup = new Group();
            const axesHelper = new AxesHelper(10);
            helperGroup.add(axesHelper);
            stats = Stats();
            document.body.appendChild(stats.dom);

            const gridHelper = new GridHelper(GridHelperParams.size, GridHelperParams.divisions);
            let tempSize: number = GridHelperParams.size;
            helperGroup.add(gridHelper);

            editorCamera = new PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
            editorCamera.position.set(x, y, z);
            editorCamera.name = "EditorCam";
            scene.add(editorCamera);

            editorCameraHelper = new CameraHelper(editorCamera);
            helperGroup.add(editorCameraHelper);

            const hemLightHelper = new HemisphereLightHelper(hemlight, 5);
            helperGroup.add(hemLightHelper);

            const directionalLightHelper = new DirectionalLightHelper(directionalLight, 5);
            helperGroup.add(directionalLightHelper);

            scene.add(helperGroup);

            /* const cameraEye = new Mesh(new SphereGeometry(0.5), new MeshBasicMaterial({ color: 0xdddddd }));
            cameraEye.position.set(x, y, z);
            scene.add(cameraEye);
            editorCamera.attach(cameraEye); */

            const transformControls = new TransformControls(mainCamera, renderer.domElement);
            helperGroup.add(transformControls);
            transformControls.enabled = false;

            const gui = new GUI();
            gui.addFolder('Settings');
            const gridFolder = gui.addFolder('Grid');
            gridFolder.add(GridHelperParams, 'size', 1, GridHelperParams.size, 1).onFinishChange(() => {
                const size = GridHelperParams.size;

                if (tempSize !== size) {
                    gridHelper.scale.setScalar(size / 10);
                    tempSize = size / 10;
                }
            });
            gridFolder.add(gridHelper, 'visible');

            helper.initGui({
                folderName: 'Cube',
                parentFolder: gui,
                object: cube,
                scale: true
            });

            let camType = 'Editor';
            // Global helper functions for debugging
            const GLOBAL_HELPER = {
                resetAll: () => {
                    helper.resetCam({ mainCamera, editorCamera, controls, transformControls });
                },
                setEditorToMain: () => {
                    helper.setEditorToMain({
                        mainCameraPos: mainCamera.position,
                        editorCamera
                    });
                },
                toggleCam: () => {
                    if (transformControls.enabled === true) {
                        return;
                    }
                    const changeTo = currentCamera === mainCamera ? editorCamera : mainCamera;
                    controls.object = changeTo;
                    controls.enabled = changeTo === mainCamera ? true : false;
                    currentCamera = changeTo;
                    renderer.render(scene, currentCamera);

                    element.innerText = `Debug Mode - ${camType} View`;
                    camType = camType === 'Editor' ? 'Main' : 'Editor';

                    helper.onWindowResize({
                        contendor, currentCamera, renderer
                    });
                },
                generateSettings: () => {
                    console.log(JSON.stringify(helper.generateSettings({
                        debug: true,
                        camera: editorCamera,
                        light: {
                            hemlight,
                            directionalLight
                        }
                    }), null, 4));
                },
            };

            GLOBAL_HELPER.resetAll();
            helper.resetCam({ mainCamera, editorCamera, controls, transformControls });

            const { handleChange } = helper;
            const cameraFolder = helper.initGui({
                folderName: 'Camera',
                parentFolder: gui,
                object: editorCamera,
                helper: editorCameraHelper
            });
            cameraFolder.add(editorCamera, 'fov', 60, 100).onChange(handleChange).listen();
            cameraFolder.add(editorCamera, 'near', 0, 1, 0.1).onChange(handleChange).listen();
            cameraFolder.add(editorCamera, 'far', 0, 500, 10).onChange(handleChange).listen();
            cameraFolder.add(GLOBAL_HELPER, 'resetAll').name('Reset All Camera (R)');
            cameraFolder.add(GLOBAL_HELPER, 'setEditorToMain').name('Set Editor Camera To Main (S)');

            cameraFolder.add(GLOBAL_HELPER, 'toggleCam').name(`Toggle Camera (T)`);

            const lightFolder = gui.addFolder('Lights');

            helper.initGui({
                folderName: 'Hemisphere Light',
                object: hemlight,
                parentFolder: lightFolder,
                helper: hemLightHelper,
                visible: false
            });

            helper.initGui({
                folderName: 'Directional Light',
                object: directionalLight,
                parentFolder: lightFolder,
                helper: directionalLightHelper,
                visible: false
            });

            gui.add(helperGroup, 'visible').name('Toggle Helpers (V)');
            gui.add(GLOBAL_HELPER, 'generateSettings').name(`Generate Settings (G)`);
            window.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'r':
                        GLOBAL_HELPER.resetAll();
                        break;

                    case 't':
                        GLOBAL_HELPER.toggleCam();
                        break;

                    case 's':
                        GLOBAL_HELPER.setEditorToMain();
                        break;

                    case 'v':
                        helperGroup.visible = !helperGroup.visible;
                        break;

                    case 'g':
                        GLOBAL_HELPER.generateSettings();
                        break;

                    /* case 'e':
                        if (currentCamera !== mainCamera) {
                            GLOBAL_HELPER.toggleCam();
                        }

                        controls.enabled = !controls.enabled;
                        transformControls.enabled = !controls.enabled;
                        break; */

                    default:
                        break;
                }
            });

            const raycaster = new Raycaster();
            const onDoubleClick = (event: MouseEvent) => {
                if (currentCamera === editorCamera) {
                    return;
                }

                const mouse = {
                    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
                    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
                };

                raycaster.setFromCamera(mouse, mainCamera);

                const intersects = raycaster.intersectObjects(scene.children, false);
                if (intersects.length > 0) {
                    transformControls.attach(intersects[0].object);
                    transformControls.enabled = true;
                    controls.enabled = false;
                } else {
                    transformControls.visible = false;
                    transformControls.enabled = false;
                    controls.enabled = true;
                }
            };

            renderer.domElement.addEventListener('dblclick', onDoubleClick, false);
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

        if (update.needsUpdate === true) {
            editorCamera?.updateMatrixWorld();
            editorCamera?.updateProjectionMatrix();
            editorCameraHelper?.update();
            update.needsUpdate = false;
        }
    }

    window.requestAnimationFrame(animate);
};

animate();