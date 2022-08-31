import './styles/style.css';
import {
    AxesHelper,
    BoxGeometry,
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

// search for settings.json
// if not found then create one with existing data from defaults
/* try {
    if (fs.existsSync('/settings.json')) {
        console.log('exists');
    }
} catch (error) {
    console.log('not exists');
} */

console.log({ ...Settings });

const scene = new Scene();

const onWindowResize = () => {
    camera.aspect = contendor.clientWidth / contendor.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(contendor.clientWidth, contendor.clientHeight);
};
window.addEventListener('resize', onWindowResize, false);

export const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.8, 1000);
camera.position.set(0, 0, 4);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);

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
    void (async () => {
        try {
            const { GUI } = await import('dat.gui');
            const { GridHelperParams } = await import('./utils/defaults');

            const axesHelper = new AxesHelper(10);
            scene.add(axesHelper);
            stats = Stats();
            document.body.appendChild(stats.dom);

            const gridHelper = new GridHelper(GridHelperParams.size, GridHelperParams.divisions);
            let tempSize: number = GridHelperParams.size;
            scene.add(gridHelper);

            const gui = new GUI();
            const gridFolder = gui.addFolder('Grid');
            gridFolder.add(GridHelperParams, 'size', 1, 10, 1).onChange(() => {
                const size = GridHelperParams.size;

                if (tempSize !== size) {
                    console.log(size / 10);
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

            const cam = { 
                reset: resetCam,
            };
            const cameraFolder = gui.addFolder('Camera');
            cameraFolder.add(cam, 'reset').name('Reset Camera');

            const camPosFolder = cameraFolder.addFolder('Position');
            camPosFolder.add(camera.position, 'x', 0, 100).listen();
            camPosFolder.add(camera.position, 'y', 0, 100).listen();
            camPosFolder.add(camera.position, 'z', 0, 100).listen();
            camPosFolder.open();
        } catch (error) {
            console.log('failed to load debug :(');
        }
    })();
}

const animate = () => {
    controls.update();
    renderer.render(scene, camera);

    if (Settings.debug === true) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        stats?.update();
    }

    window.requestAnimationFrame(animate);
};

animate();