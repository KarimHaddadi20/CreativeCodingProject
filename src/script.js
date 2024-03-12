import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Particles
const particlesCount = 5000
const positionsRandom = new Float32Array(particlesCount * 3)
const positionsSphere = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount * 3; i += 3) {
    positionsRandom[i] = (Math.random() - 0.5) * 5
    positionsRandom[i + 1] = (Math.random() - 0.5) * 5
    positionsRandom[i + 2] = (Math.random() - 0.5) * 5
}

function getRandomPointOnSphere(radius) {
    var vector = new THREE.Vector3()
    var phi = Math.random() * 2 * Math.PI
    var theta = Math.random() * Math.PI

    vector.x = radius * Math.sin(theta) * Math.cos(phi)
    vector.y = radius * Math.sin(theta) * Math.sin(phi)
    vector.z = radius * Math.cos(theta)

    return vector
}

for (let i = 0; i < particlesCount * 3; i += 3) {
    const randomSpherePoint = getRandomPointOnSphere(1)
    positionsSphere[i] = randomSpherePoint.x
    positionsSphere[i + 1] = randomSpherePoint.y
    positionsSphere[i + 2] = randomSpherePoint.z
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionsRandom, 3))

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.01,
    color: '#1113DB',
    sizeAttenuation: true,
    transparent: true,
    depthWrite: false,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/1.png')
particlesMaterial.map = particleTexture
particlesMaterial.alphaMap = particleTexture

// Animation
const particlesInfos = []
for (let i = 0; i < particlesCount; i++) {
    const particleIndex = i * 3
    const particle = {
        randomPos: {
            x: positionsRandom[particleIndex],
            y: positionsRandom[particleIndex + 1],
            z: positionsRandom[particleIndex + 2],
        },
        currentPos: {
            x: positionsRandom[particleIndex],
            y: positionsRandom[particleIndex + 1],
            z: positionsRandom[particleIndex + 2],
        },
        spherePos: {
            x: positionsSphere[particleIndex],
            y: positionsSphere[particleIndex + 1],
            z: positionsSphere[particleIndex + 2],
        }
    }
    particlesInfos.push(particle)
}

const timeline = gsap.timeline({
    onUpdate: () => {
        for (let i = 0; i < particlesInfos.length; i++) {
            const particleIndex = i * 3
            particlesGeometry.attributes.position.array[particleIndex] = particlesInfos[i].currentPos.x
            particlesGeometry.attributes.position.array[particleIndex + 1] = particlesInfos[i].currentPos.y
            particlesGeometry.attributes.position.array[particleIndex + 2] = particlesInfos[i].currentPos.z
        }
    }
})
timeline.pause()

for (let i = 0; i < particlesInfos.length; i++) {
    const particleIndex = i * 3
    timeline.to(particlesInfos[i].currentPos, {
        x: particlesInfos[i].spherePos.x,
        y: particlesInfos[i].spherePos.y,
        z: particlesInfos[i].spherePos.z,
        duration: 2,
        ease: 'power3.inOut'
    }, 0)
}

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0xffffff)

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    particles.rotation.y += 0.01

    particlesGeometry.attributes.position.needsUpdate = true

    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()

// Scroll
let maxHeight = document.querySelector('.scroll-container').clientHeight - window.innerHeight
window.addEventListener('scroll', (event) => {
    const scroll = window.scrollY
    const progress = scroll / maxHeight
    timeline.progress(progress)
})

document.addEventListener('DOMContentLoaded', (event) => {
    // Votre code ici
    let maxHeight = document.querySelector('.scroll-container').clientHeight - window.innerHeight;
    window.addEventListener('scroll', (event) => {
        const scroll = window.scrollY;
        const progress = scroll / maxHeight;
        timeline.progress(progress);
    });
});