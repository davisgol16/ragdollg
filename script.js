// Configuração do Matter.js
const { Engine, Render, Runner, World, Bodies, Body, Events, Constraint, Mouse, MouseConstraint } = Matter;

// Criar o motor de física e o renderizador
const engine = Engine.create();
const world = engine.world;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false
    }
});

// Função para criar um ragdoll
const createRagdoll = (x, y) => {
    const bodyParts = [];
    const sizes = [40, 30, 20]; // tamanhos dos corpos

    sizes.forEach((size, index) => {
        const part = Bodies.rectangle(x, y - (index * 50), size, size, {
            render: {
                fillStyle: 'red'
            }
        });
        bodyParts.push(part);
        World.add(world, part);
    });

    // Conectar as partes do corpo
    for (let i = 0; i < bodyParts.length - 1; i++) {
        const constraint = Constraint.create({
            bodyA: bodyParts[i],
            bodyB: bodyParts[i + 1],
            length: 10,
            stiffness: 0.5
        });
        World.add(world, constraint);
    }

    return bodyParts;
};

// Criar o chão
const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 50, window.innerWidth, 100, {
    isStatic: true
});
World.add(world, ground);

// Criar o ragdoll na posição inicial
const ragdoll = createRagdoll(400, 100);

// Adicionar o corredor
const runner = Runner.create();
Runner.run(runner, engine);

// Iniciar o renderizador
Render.run(render);

// Variáveis de controle do mouse
let selectedRagdoll = null;
let score = 0;
const scoreElement = document.getElementById('score');
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
World.add(world, mouseConstraint);

// Atualizar a pontuação
const updateScore = () => {
    score++;
    scoreElement.innerText = `Pontuação: ${score}`;
};

// Controlar o ragdoll com o mouse
Events.on(mouseConstraint, 'mousedown', (event) => {
    const mousePosition = event.mouse.position;
    selectedRagdoll = ragdoll.find(part => {
        return Matter.Bounds.contains(part.bounds, mousePosition);
    });

    if (selectedRagdoll) {
        updateScore();
    }
});

Events.on(mouseConstraint, 'mousemove', (event) => {
    if (selectedRagdoll) {
        const mousePosition = event.mouse.position;
        Matter.Body.setPosition(selectedRagdoll, mousePosition);
    }
});

Events.on(mouseConstraint, 'mouseup', () => {
    selectedRagdoll = null;
});

// Ajustar o tamanho da tela ao redimensionar
window.addEventListener('resize', () => {
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    Render.setPixelRatio(render, window.devicePixelRatio);
    Render.run(render);
});
