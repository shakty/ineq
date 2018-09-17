var node = parent.node;
var W = parent.W;
var J = parent.J;

// TODO: check vars/globals in Production.
//////////////////////////////////////////

// Settings.
////////////

function doPlot(s) {
    s = s || {};

    // Get and conf plot DIV.
    
    var divId = s.divId || 'myDiv';

    myPlot = document.getElementById(divId);
    if (!myPlot) throw new Error('Could not find requested div: ' + divId);

    // Size.
    myPlot.style.width = s.plotWidth || '700px';
    myPlot.style.height = s.plotHeight || '700px';
    
    // Plot settings.
    
    // X axis of all distributions.
    var left = 'undefined' === typeof s.left ? 1 : s.left;
    var right = 'undefined' === typeof s.right ? 100 : s.right;

    var nPoints = 'undefined' === typeof s.nPoints ? 100 : s.nPoints;
    var x = jStat.seq(left, right, nPoints);

    // Income and Poverty distribution.
    var incomeMean = 'undefined' === typeof s.incomeMean ?
        100 : s.incomeMean;
    var incomeSd = 'undefined' === typeof s.incomeSd ?  10 : s.incomeSd;

    var povertyLevel = 'undefined' === typeof s.povertyLevel ?
        0.02 : s.povertyLevel;

    // Talent distribution.
    var talentMean = 'undefined' === typeof s.talentMean ?
        50 : s.talentMean;
    var talentSd = 'undefined' === typeof s.talentSd ? 20 : s.talentSd;

    // Type of mapping between income and talent.
    var mapType = 'undefined' === typeof s.mapType ? 'RANDOM' : s.mapType;

    // Multipliers and Increments.
    var multIncome = 'undefined' === typeof s.multIncome ?
        nPoints : s.multIncome;

    var multPoverty = 'undefined' === typeof s.multPoverty ?
        nPoints : s.multPoverty;
    
    var incIncome = 'undefined' === typeof s.incIncome ?
        0 : s.incIncome;

    var incPoverty = 'undefined' === typeof s.incPoverty ?
        0 : s.incPoverty;
    
    // Var iniatialized later.

    // Plotly traces.
    var income, povertyLine, talent;

    // Normal distribution generator.
    var ynorm;

    // Y axis values.
    var yIncome, yPoverty, yTalent;

    // Maps.
    var maps, mapIncome2Talent, mapTalent2Income;

    // Plotly params.
    var data, layout, config;

    // Div containing the plot.
    var myPlot;

    // Create map.
    //////////////

    function createMaps(mapType) {
        var i, t, tmp;
        var mapIncome2Talent = new Array(nPoints);
        var mapTalent2Income = new Array(nPoints);
        if (mapType === 'RANDOM') {
            mapIncome2Talent = J.shuffle(x);
            for (i = 0; i < nPoints; i++) {
                mapTalent2Income[mapIncome2Talent[i]] = i;
            }
        }
        else {
            throw new Error('Unknown map type :' + mapType);
        }
        return {
            mapIncome2Talent: mapIncome2Talent,
            mapTalent2Income: mapTalent2Income
        };
    }

    maps = createMaps(mapType);
    mapIncome2Talent = maps.mapIncome2Talent;
    mapTalent2Income = maps.mapTalent2Income;

    // Setup Plotly Lines.
    ////////////////

    // Income & Povery Line.

    jnorm = jStat.normal(incomeMean, incomeSd);
    yIncome = jnorm.pdf(x)[0];
    yPoverty = J.rep([povertyLevel], nPoints);

    if (multIncome) scaleCurveMult(yIncome, multIncome);
    if (multPoverty) scaleCurveMult(yPoverty, multPoverty);

    if (incIncome) scaleCurveInc(yIncome, incIncome);
    if (incPoverty) scaleCurveInc(yPoverty, incPoverty);

    
    income = {
        x: x,
        y: yIncome,
        name: 'Income',
        mode: 'lines+marker',
        line: {
            color: 'rgb(219, 64, 82)',
            width: 6
        }
    };
    povertyLine = {
        x: x,
        y: yPoverty,
        name: 'Poverty Line',
        mode: 'lines',
        line: {
            dash: 'dashdot',
            color: 'rgb(55, 128, 191)',
            width: 6
        }
    };

    // Talent.

    jnorm = jStat.normal(talentMean, talentSd);
    yTalent = jnorm.pdf(x)[0];

    talent = {
        x: x,
        y: yTalent,
        name: 'Talent',
        mode: 'lines',
        line: {
            color: '#000',
            width: 6
        },
        xaxis: 'x2',
        yaxis: 'y2'
    };

    data = [ income, povertyLine, talent ];

    layout = {
        hovermode: 'closest',
        // title: 'Income Distribution and Povery Line',
        // legend: {
        //     x: 0.2,
        //     y: 0.9,
        //     traceorder: 'reversed',
        //     font: {size: 16},
        //     yref: 'paper'
        // },
        xaxis: {
            title: 'People with given income',
            // hoverformat: '.2r'
            // range: [0.75, 5.25],
            // autorange: false
        },
        yaxis: {
            title: 'Income Share (%) of Total',
            domain: [0.55, 1],
            hoverformat: '.2r'
        },

        yaxis2: {
            domain: [0, 0.45],
            hoverformat: '.2r'
        },
        xaxis2: {
            anchor: 'y2',
            title: 'Talent',
            // hoverformat: '.2r'
        },
        showLegend: false
    };

    config = {
        // editable: true,
        // scrollZoom: true,
        // staticPlot: true,
        displayModeBar: false,
        // showLink: true,
        // modeBarButtonsToRemove: ['toImage']
    };

    // Do Plot.

    Plotly.newPlot(myPlot, data, layout, config);

    // Hovering.

    myPlot.on('plotly_hover', function(eventData){
        // console.log(eventData);
        var hoveredCurve, incomePoint, talentPoint;
        hoveredCurve = eventData.points[0].curveNumber;
        // Poverty line, do nothing.
        if (hoveredCurve === 1) return;

        if (hoveredCurve === 0) {
            incomePoint = eventData.points[0].pointNumber;
            talentPoint = mapIncome2Talent[incomePoint];
        }
        else {
            talentPoint = eventData.points[0].pointNumber;
            incomePoint = mapIncome2Talent[talentPoint];
        }

        Plotly.Fx.hover(myPlot, [
            { curveNumber: 0, pointNumber: incomePoint },
            { curveNumber: 2, pointNumber: talentPoint }
        ], ['xy', 'x2y2']);
    });

    // Helper functions.

    function scaleCurveMult(y, mult) {
        for (var i = 0; i < y.length; i++) {
            y[i] *= mult;
        }
    }
    
    function scaleCurveInc(y, increment) {
        for (var i = 0; i < y.length; i++) {
            y[i] += increment;
        }
    }

}