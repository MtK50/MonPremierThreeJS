import * as THREE from 'three';
import * as dat from 'dat.gui';
import gsap from 'gsap';

console.log(gsap)

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { randFloat } from 'three/src/math/MathUtils';
import { arraySlice } from 'three/src/animation/AnimationUtils';

// -- GUI INITIALISATION
const gui = new dat.GUI();
const world = {
    plane: {
        width: 30,
        height: 30,
        widthSegments: 50,
        heightSegments: 50
    }
}

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
//             new THREE.PerspectiveCamera(FOV, aspect ratio, near, far)
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

scene.background = new THREE.Color( 0x522585 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

// --> CUBE
//                    new THREE.BoxGeometry( w, h, depth, wSeg)
const geometry_cube = new THREE.BoxGeometry( 1, 1, 1 );
const material_cube = new THREE.MeshBasicMaterial({
        color: 0xFF0000
    });
const cube = new THREE.Mesh( geometry_cube, material_cube );
scene.add( cube );


// --> PLANE
//                     new THREE.PlaneGeometry( w, h, wSeg, hSeg)
const geometry_plane = new THREE.PlaneGeometry( 
        world.plane.width, 
        world.plane.height, 
        world.plane.widthSegments, 
        world.plane.heightSegments
    );
const material_plane = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        flatShading: true,
        vertexColors: true
    });
const plane = new THREE.Mesh(geometry_plane, material_plane);
scene.add(plane);
// console.log(plane.geometry.attributes.position.array);


// --> LIGHT - front
//                  new THREE.DirectionalLight(color, intensity);
const front_light = new THREE.DirectionalLight(0xFFFFFF, 1);
front_light.position.set(0, 0, 1); // X, Y, Z
scene.add(front_light);
// --> LIGHT - back
const back_light = new THREE.DirectionalLight(0xFFFFFF, 1);
back_light.position.set(0, 0, -1);
scene.add(back_light);



generatePlane();
//     (target,      'propName',     min, max, step)        (functionCalled)
gui.add(world.plane, 'width',          1,  50,  0.5).onChange(generatePlane);
gui.add(world.plane, 'height',         1,  50,  0.5).onChange(generatePlane);
gui.add(world.plane, 'widthSegments',  1,  50,    1).onChange(generatePlane);
gui.add(world.plane, 'heightSegments', 1,  50,    1).onChange(generatePlane);


function generatePlane(){
    plane.geometry.dispose();
    plane.geometry = new THREE.PlaneGeometry(
        world.plane.width,
        world.plane.height,
        world.plane.widthSegments,
        world.plane.heightSegments
    );
    
    const {array} = plane.geometry.attributes.position; // récupération des vertices pour l'effet de profondeur dans l'axe Z
    for (let i = 0; i < array.length; i += 3)
    {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    // array[i] = x + Math.random() - 0.5;
    // array[i + 1] = y + Math.random() - 0.5;
    array[i + 2] = z + Math.random() * .8;
    }
    const colors = []
    for (let i = 0; i < plane.geometry.attributes.position.count; i++){
        colors.push(0, .19, .4);
    }

    plane.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(new Float32Array(colors),3) // R, G, B => 3 valeurs de données
    )
}





const mouse = {
    x: undefined,
    y: undefined
};
let frame = 0;
function animate() {
	requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01; 

	renderer.render( scene, camera );
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0){
        // console.log(intersects[0].face);
        const {color} = intersects[0].object.geometry.attributes;

        const intialColor = {
            r: 0,
            g: 0.19,
            b: 0.4
        }
        const hoverColor = {
            r: 0.1,
            g: 0.5,
            b: 1
        }
        gsap.to(hoverColor, {
            r:intialColor.r,
            g:intialColor.g,
            b:intialColor.b,
            onUpdate: () => {
                color.setX(intersects[0].face.a, hoverColor.r);
                color.setY(intersects[0].face.a, hoverColor.g);
                color.setZ(intersects[0].face.a, hoverColor.b);
        
                // Vertice 2 
                color.setX(intersects[0].face.b, hoverColor.r);
                color.setY(intersects[0].face.b, hoverColor.g);
                color.setZ(intersects[0].face.b, hoverColor.b);
        
                // Vertice 3 
                color.setX(intersects[0].face.c, hoverColor.r);
                color.setY(intersects[0].face.c, hoverColor.g);
                color.setZ(intersects[0].face.c, hoverColor.b);
                intersects[0].object.geometry.attributes.color.needsUpdate = true;
            }

        });
    };        
};
animate();

addEventListener('mousemove', (event) => {
    mouse.x = ((event.clientX / innerWidth) * 2 - 1).toFixed(3);
    mouse.y = (-(event.clientY / innerHeight) * 2 + 1).toFixed(3);
    // console.log(mouse);
})