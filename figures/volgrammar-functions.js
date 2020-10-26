const width = 960;
const height = 500;

function createPaths(globalConfig, cellData, Nrow = 9, diskScaleX = 1, diskScaleY = 1) {
    var diskDds = [globalConfig.dds[0][0] * diskScaleX, globalConfig.dds[1][0] * diskScaleY];
    var cellsDisk = cellData.map((d, flatIndex) => d3.rect({
        x: (d.flatIndex % Nrow) * diskDds[0] + globalConfig.bounds[0][0][0] + d.groupOffset,
        y: Math.floor(d.flatIndex / Nrow) * diskDds[1] + globalConfig.bounds[1][0][0],
        width: diskDds[0],
        height: diskDds[1]
    }));
    var cellsMemory = cellData.map(d => d3.rect({
        x: d.x[0],
        y: d.y[0],
        width: d.width[0],
        height: d.height[0]
    }));
    var cellsCyl = cellData.map(d => d3.arc()({
        innerRadius: d.x[1],
        outerRadius: d.x[1] + d.width[1],
        startAngle: d.y[1],
        endAngle: d.y[1] + d.height[1],
        padAngle: 0.0
    }));
    return {
        'disk': cellsDisk,
        'memory': cellsMemory,
        'cyl': cellsCyl
    };
}

function defaultConfig(Ndims, bounds) {
    // first dimension of bounds is the dimension, second is the variable
    // so bounds[0] corresponds to i, bounds[1] to j, bounds[0][0] is x
    // bounds[0][1] is r, bounds[0][0][0] is left, bounds[0][0][1] is right
    var cfg = {
        Ndims: Ndims,
        width: [],
        dds: [],
        bounds: bounds
    };
    Ndims.forEach((nd, i) => {
        cfg.width.push(bounds[i].map(v => (v[1] - v[0])));
        cfg.dds.push(bounds[i].map(v => (v[1] - v[0]) / nd));
    });
    return cfg;
}

function createCells(globalConfig, level, dims, levelIndex, groupOffset = 0) {
    var dds = globalConfig.dds.map(v1 => v1.map(v2 => (v2 / (2 ** level))));
    var thisLeft = globalConfig.bounds.map((v1, i) => v1.map((v2, j) => (v2[0] + dds[i][j] * levelIndex[i])));
    var data = [];
    d3.range(dims[1]).forEach(j => d3.range(dims[0]).forEach(i => {
        data.push({
            flatIndex: i * dims[1] + j,
            i: i,
            j: j,
            x: thisLeft[0].map((l, n) => (i * dds[0][n] + l)),
            y: thisLeft[1].map((l, n) => (j * dds[1][n] + l)),
            width: dds[0],
            height: dds[1],
            groupOffset: groupOffset
        });
    }));
    return data;
}

function ringermacherMead(A, B, N) {
    return function(phi) {
        return A / Math.log(B * Math.tan(phi / (2 * N)));
    }
}

function kelvinHelmholtzAMR(kh, kh_amr) {
    var complexConfig = defaultConfig([32, 32], [
        [
            [0, 512.0],
            [20.0 + width / 2, 200.0]
        ],
        [
            [0, 512.0],
            [0.0, Math.PI]
        ]
    ]);
    var cellData0 = createCells(complexConfig, 0, [32, 32], [0, 0], 0);
    var cellData1 = createCells(complexConfig, 1, [64, 32], [0, 32], 0);
    var cellData2 = createCells(complexConfig, 2, [64, 50], [32, 64], 0);
    cellData0.forEach(d => {
        d.density = kh[d.j][d.i];
        d.level = 0;
    });
    cellData1.forEach(d => {
        d.density = kh_amr[0]["density"][d.i][d.j + 32];
        d.velocity_x = kh_amr[0]["velocity_x"][d.i][d.j + 32];
        d.velocity_y = kh_amr[0]["velocity_y"][d.i][d.j + 32];
        d.level = 1;
    });
    cellData2.forEach(d => {
        d.density = kh_amr[1]["density"][d.i + 32][d.j + 50];
        d.velocity_x = kh_amr[1]["velocity_x"][d.i + 32][d.j + 50];
        d.velocity_y = kh_amr[1]["velocity_y"][d.i + 32][d.j + 50];
        d.level = 2;
    });

    // Remove overlapping data
    cellData0 = cellData0.filter(c => {
        var ind = [c.i * 2, c.j * 2];
        var overlaps = ((ind[0] >= 0) && (ind[0] < 64) && (ind[1] >= 32) && (ind[1] < 64));
        return !overlaps;
    });
    cellData1 = cellData1.filter(c => {
        var ind = [c.i * 2, c.j * 2];
        var overlaps = ((ind[0] >= 32) && (ind[0] < 96) && (ind[1] >= 64) && (ind[1] < 114));
        return !overlaps;
    });
    var cellData = cellData0.concat(cellData1).concat(cellData2);
    var cellPaths = createPaths(complexConfig, cellData, 10);
    var tree = d3.quadtree().x(d => d.x[0] + d.width[0] / 2).y(d => d.y[0] + d.height[0] / 2).addAll(cellData);
    return {
        'kh_amr': kh_amr,
        'cellData': cellData,
        'cellPaths': cellPaths,
        'tree': tree
    };
}

function findOverlappingNodesPoint(point, biggestCell, fn) {
    function visitTree(node, x0, y0, x1, y1) {
        if (x0 > point[0] + biggestCell[0] / 2 || x1 < point[0] - biggestCell[0] / 2 ||
            y0 > point[1] + biggestCell[1] / 2 || y1 < point[1] - biggestCell[1] / 2) {
            return true;
        }
        if (!node.length)
            do {
                var d = node.data;
                if ((point[0] >= d.x[0]) && (point[0] <= d.x[0] + d.width[0]) &&
                    (point[1] >= d.y[0]) && (point[1] <= d.y[0] + d.height[0])) {
                    fn(d);
                };
            } while (node = node.next);
    }
    return visitTree;
}

function findOverlappingNodesRect(extent, fn) {
    function visitTree(node, x0, y0, x1, y1) {
        if (x0 > extent[1][0] || x1 < extent[0][0] || y0 > extent[1][1] || y1 < extent[0][1]) {
            return true;
        }
        if (!node.length)
            do {
                var d = node.data;
                if (extent[0][0] < d.x[0] + d.width[0] / 2 && extent[0][1] < d.y[0] + d.height[0] / 2 &&
                    extent[1][0] > d.x[0] + d.width[0] / 2 && extent[1][1] > d.y[0] + d.height[0] / 2) {
                    fn(d);
                };
            } while (node = node.next);
    }
    return visitTree;
}

cfg = defaultConfig([6, 8], [
    [
        [-120.0, 120.0],
        [20.0, 200.0]
    ],
    [
        [-160.0, 160.0],
        [0.0, Math.PI]
    ]
]);

rootGrid = createCells(cfg, 0, [6, 8], [0, 0], -220);

refinedData = createCells(cfg, 1, [4, 8], [4, 2], 160);
