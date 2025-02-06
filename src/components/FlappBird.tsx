import React from "react";
import {Stage, Container, AnimatedSprite, Sprite,TilingSprite,useTick, useApp, AppProvider } from '@pixi/react';
import * as PIXI from 'pixi.js';


const PIPE_SPEED = 5;
const GRAVITY = 3 ;
const JUMP_FORCE = 5;

interface Bird {
    y:number
    isJumping:boolean
}

interface Pipe {
    x: number;
    topHeight: number;
    scored: boolean;
    gap: number;
}

interface GameDimensions {
    width: number;
    height: number;
}

interface GameState {
    score: number;
    gameOver: boolean;
}

interface PipeImages {
    head: PIXI.Texture;
    body: PIXI.Texture;
}

interface PipeContainerProps {
    x: number;
    topHeight: number;
    pipeImage: PipeImages | undefined;
    gap: number;
    screenHeight: number;
}

interface FlappyBirdProps {
    dimensions: GameDimensions;
}

const PipeContainer = ({
    x,
    topHeight,
    pipeImage,
    gap,
    screenHeight
}: PipeContainerProps) => {
    if (!pipeImage) return null;

    return (
        <Container>
            {/* Top pipe */}
            <Container>
                {/* 可延展的中間部分 */}
                <TilingSprite 
                    x={x}
                    y={0}
                    texture={pipeImage.body}
                    width={pipeImage.body.width}
                    height={topHeight}
                    anchor={[0.5, 1]}
                    tilePosition={{ x: 0, y: topHeight }}
                    rotation={Math.PI}
                />
                {/* 頂部 cap */}
                <Sprite 
                    x={x}
                    y={topHeight}
                    texture={pipeImage.head}
                    anchor={[0.5, 1]}
                    rotation={Math.PI}
                    
                />

                <TilingSprite 
                    x={x}
                    y={topHeight + gap}
                    texture={pipeImage.body}
                    width={pipeImage.body.width}
                    height={screenHeight - topHeight - gap}
                    tilePosition={{ x: 0, y: 0 }}
                    anchor={[0.5, 0]}
                />
                <Sprite 
                    x={x}
                    y={topHeight + gap}
                    texture={pipeImage.head}
                    anchor={[0.5, 0]}
                />
            </Container>
        </Container>
    );
};


const FlappyBird = ({
    dimensions
}:FlappyBirdProps) => {
    const [bird,setBird] = React.useState<Bird>({y:dimensions.height/2,isJumping:false});
    const [pipes,setPipes] = React.useState<Pipe[]>([]);
    const [gameState,setGameState] = React.useState<GameState>({score:0,gameOver:false});
    const [birdImages, setBirdImages] = React.useState<PIXI.Texture[]>([]);
    const [baseImage, setBaseImage] = React.useState<PIXI.Texture>();
    const [pipeImages, setPipeImage] = React.useState<PipeImages>();
    const [isInited, setIsInited] = React.useState<boolean>(false);

    const createPipe = React.useCallback(()=>{
        const gap = Math.random() * 300 + 100; // 200~600
        const minPipeHeight = dimensions.height*0.2;
        const maxPipeHeight = dimensions.height- gap - minPipeHeight;
        const topHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
        setPipes(prevPips => [...prevPips,{
            x:dimensions.width,
            topHeight:topHeight,
            scored:false,
            gap:gap
        }])
    },[dimensions.width,dimensions.height]);

    // 碰撞邏輯
    const checkCollision = (bird:Bird,pipes:Pipe[])=>{
        // TODO: 檢查是否碰撞
    }

    // Initialize the game
    React.useEffect(() => {
        const loadAssets = async () => {
            try {
                // Load bird images
                const birdTextures = [
                    PIXI.Texture.from('/flappy-bird-assets/sprites/bluebird-downflap.png'),
                    PIXI.Texture.from('/flappy-bird-assets/sprites/bluebird-midflap.png'),
                    PIXI.Texture.from('/flappy-bird-assets/sprites/bluebird-upflap.png'),
                ];

                // Load pipe images
                const pipeHeader = PIXI.Texture.from('/flappy-bird-assets/sprites/pipe-green-header.png');
                const pipeBody = PIXI.Texture.from('/flappy-bird-assets/sprites/pipe-green-body.png');

                // Load the ground image
                const baseTexture = PIXI.Texture.from('/flappy-bird-assets/sprites/base.png');

                // 等待所有紋理加載完成
                await Promise.all([
                    ...birdTextures.map(texture => texture.baseTexture.resource.load()),
                    pipeHeader.baseTexture.resource.load(),
                    pipeBody.baseTexture.resource.load()
                ]);

                setBirdImages(birdTextures);
                setBaseImage(baseTexture);
                setPipeImage({head: pipeHeader, body: pipeBody});
                setIsInited(true);
            } catch (error) {
                console.error('Error loading assets:', error);
            }
        };

        loadAssets();

        return () => {
            birdImages.forEach((texture) => {
                if (texture) texture.destroy(true);
            });

            setIsInited(false);
        };
    }, []);

    // 修改跳躍處理
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === ' ' && bird.isJumping === false) {
                setBird(prevBird => ({
                    ...prevBird,
                    isJumping: true,
                }));
                setTimeout(() => {
                    setBird(prevBird => ({
                        ...prevBird,
                        isJumping: false,
                    }));
                }, 100);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);



    useTick(delta => {
        if (gameState.gameOver) return;

        if (pipes.length === 0 || pipes[pipes.length - 1].x < dimensions.width - dimensions.width / 3) {
            createPipe();
        }

        // 移動現有的管道
        setPipes(prevPipes => {
            return prevPipes
                .map(pipe => ({
                    ...pipe,
                    x: pipe.x - PIPE_SPEED * delta
                }))
                .filter(pipe => pipe.x > -50);
        });

        // 更新分數
        pipes.forEach((pipe, index) => {
            if (pipe.x < dimensions.width / 2 && !pipe.scored) {
                setGameState(prevState => ({
                    ...prevState,
                    score: prevState.score + 1
                }));

                setPipes(prevPipes => {
                    const newPipes = [...prevPipes];
                    newPipes[index].scored = true;
                    return newPipes;
                });

                console.log(gameState.score);
            }
        });

        // 更新小鳥位置 - 添加重力效果
        setBird(prevBird => {
            // 檢查是否碰到管道
            if (prevBird.isJumping) {
                return {
                    ...prevBird,
                    y: prevBird.y - JUMP_FORCE* delta,
                };
            }else {
                return {
                    ...prevBird,
                    y: prevBird.y + GRAVITY * delta,
                }
            }
        });


    })





    // If the game is not initialized, return null
    if (!isInited) {
        return null;
    }



    return (
        <Container>
            <AnimatedSprite
                isPlaying={true}
                anchor={0.5}
                textures={birdImages}
                animationSpeed={0.1}
                x={dimensions.width/2}
                y={bird.y}
            />
            {pipes.map((pipe,index)=>(
                <PipeContainer key={index} x={pipe.x} topHeight={pipe.topHeight} pipeImage={pipeImages} gap={pipe.gap} screenHeight={dimensions.height}/>
            ))}
            <TilingSprite
                x={dimensions.width/2}
                y={dimensions.height}
                texture={baseImage}
                anchor={0.5}
                width={dimensions.width}
                height={dimensions.height*0.2}
                tilePosition={{x:0,y:0}}
            />
        </Container>
    )
}

export const FlappyBirdApp = () => {
    const [dimensions, setDimensions] = React.useState<GameDimensions>({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    // const [app, setApp] = React.useState<PIXI.Application | null>(null);

    React.useEffect(() => {
        // const newApp = new PIXI.Application({
        //     width: dimensions.width,
        //     height: dimensions.height,
        // });

        // 確保 DOM 已經準備好
        // document.body.appendChild(newApp.view as HTMLCanvasElement);
        // setApp(newApp);

        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            // newApp.renderer.resize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            // newApp.destroy(true, { children: true, texture: true, baseTexture: true });
        };
    }, []);

    // if (!app) return null;

    return (
        <Stage width={dimensions.width} height={dimensions.height}>
            <Sprite image="/flappy-bird-assets/sprites/background-day.png" width={dimensions.width} height={dimensions.height} />
            <FlappyBird dimensions={dimensions} />
        </Stage>
    );
};




