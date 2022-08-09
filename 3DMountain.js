//Jacob Silviera
//CST-310



(function Grid() {
   //setting up graphic
    var angleX = 30;
    var angleY = 0;
    var gl = GL.create({ stencil: false, alpha: false });
    var width = 400;
    var height = 400;
    var ratio = window.devicePixelRatio || 2;
    gl.canvas.width = Math.round(width * ratio); //returns the value of a number rounded to the nearest integer
    gl.canvas.height = Math.round(height * ratio);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.matrixMode(gl.PROJECTION); //change projection matrix
    gl.perspective(45, gl.canvas.width/gl.canvas.height, 0.1, 100);
    gl.matrixMode(gl.MODELVIEW); //sets current matrix mode
    gl.enable(gl.DEPTH_TEST); //tests the depth value of a fragment against the content of the depth buffer
    gl.getExtension('OES_standard_derivatives'); //adds GLSL derivative functions
    //https://developer.mozilla.org/en-US/docs/Web/API/OES_standard_derivatives
    document.getElementById('shader').style.maxWidth = width + 'px';
    document.getElementById('shader').appendChild(gl.canvas);

    var mesh = GL.Mesh.plane({ detail:10}); //mesh variable
    for (var i = 0; i < mesh.vertices.length; i++) {
        var v = mesh.vertices[i];
        mesh.vertices[i] = [10 * v[0], Math.random() * 2 - 1, 10 * v[1]]; //vertices
    }
    mesh.compile(); //compiling the mesh

    //shader
    var shaders = {};
    var current = 'vertex.xz'; //current variable set
    var vertex = [
        'varying vec3 vertex;',
        '',
        'void main() {',
        '  vertex = vec3(gl_Vertex.x * 3.0, gl_Vertex.y * 6.0, gl_Vertex.z * 3.0);',
        '  gl_Position = gl_ModelViewProjectionMatrix * vec4(gl_Vertex.xyz, 1.0);', //model view matrix multiplied by vec4(gl_Vertex.xyz)
        '}',
    ].join('\n');
    var fragments = {
        'vertex.xz': [
            '#extension GL_OES_standard_derivatives : enable',
            '',
            'varying vec3 vertex;',
            '',
            'void main() {',
            '  vec2 coord = vertex.xz;', //coordinate in grid picked to vizualize
            '',
            '  vec2 grid = abs(fract(coord - 0.5) - 0.5)/fwidth(coord);', //computing the grid lines
            '  float line = min(grid.x, grid.y);',
            '',
            '  float color = 1.0 - min(line, 1.0);', //visualize grid lines directly
            '',
            '  color = pow(color, 1.0 / 2.0);', //gamma correction
            '  gl_FragColor = vec4(vec3(color), 1.0);',
            '}',
        ].join('\n'),
    };

    var coordinates = document.getElementById('coordinates'); //getting coordinates
    Object.keys(fragments).forEach(function(coord) {
        var fragment = fragments[coord];
        shaders[coord] = {
            vertex: vertex,
            fragment: fragment,
            shader: new GL.Shader(vertex, fragment)
        };

    });
    gl.onupdate = function(seconds) {
        angleY += seconds * 5;
    };
//to rotate the graphic
    gl.ondraw = function Grid() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.loadIdentity();
        gl.translate(0, 0, -5);
        gl.rotate(angleX, 2, 0, 0);
        gl.rotate(angleY, 0, 2, 0);
        shaders[current].shader.draw(mesh);
    };
    function updateSyntaxHighlighting() {
        var pre = document.getElementById('fragment');
        pre.textContent = shaders[current].fragment;
        if (this.syntaxHighlighting) syntaxHighlighting(pre);
    }
    [].forEach.call(document.getElementsByTagName('input'), function(element) {
        if (element.name === 'coordinates') {
            element.onchange = function Grid() {
                if (element.checked) {
                    current = element.value;
                    updateSyntaxHighlighting();
                }
            };
        }
    });
    updateSyntaxHighlighting();
    gl.animate();
})();