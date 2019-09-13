import React from 'react';
import { render } from 'react-three-fiber';

Thing3d({ vertices }) extends React.Component {
    render(){
        return (
            <group ref={ref => console.log('we have access to the instance')}>
                <line>
                <geometry
                attach="geometry"
                vertices={vertices.map(v => new THREE.Vector3(...v))}
                onUpdate={self => (self.verticesNeedUpdate = true)}
                />
                <lineBasicMaterial attach="material" color="black" />
                </line>
                <mesh 
                    onClick={e => console.log('click')} 
                    onPointerOver={e => console.log('hover')} 
                    onPointerOut={e => console.log('unhover')}>
                    <octahedronGeometry attach="geometry" />
                        <meshBasicMaterial attach="material" color="peachpuff" opacity={0.5} transparent />
                </mesh>
            </group>
        )
    }
}
export default Thing3d;