class Cone {
    constructor() {
        this.type = 'cone';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const delta = 0.1;
        const angle = 360 / 10;
        for (let step = 0; step < 360; step += angle) {
            const a1 = step;
            const a2 = step + angle;
            const v1 = [Math.cos((a1 * Math.PI) / 180) * delta, Math.sin((a1 * Math.PI) / 180) * delta];
            const v2 = [Math.cos((a2 * Math.PI) / 180) * delta, Math.sin((a2 * Math.PI) / 180) * delta];

            const p1 = [0 + v1[0], 0 + v1[1]];
            const p2 = [0 + v2[0], 0 + v2[1]];
            drawTriangle3D([0, 0, 0, p1[0], p1[1], 0.2, p2[0], p2[1], 0.2]);
        }
    }
}