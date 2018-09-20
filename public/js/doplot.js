var node = parent.node;
var W = parent.W;
var J = parent.J;

// TODO: check vars/globals in Production.
//////////////////////////////////////////

// Settings.
////////////

function doPlot(s) {
    s = s || {};

    // Store user's actions on chart.
    var actions = [];
    
    // Indexes to get info back from array of mapped points.
    // @see getPointsFromEvent
    var iIdx = 0;
    var tIdx = 1;
    
    // Get and conf plot DIV.
    
    var divId = s.divId || 'myDiv';

    myPlot = document.getElementById(divId);
    if (!myPlot) throw new Error('Could not find requested div: ' + divId);

    // Size.
    myPlot.style.width = s.plotWidth || '100%'; // '800px';
    myPlot.style.height = s.plotHeight || '400px';

    // Examples Div.

    var examplesDiv = document.getElementById('examples');
    
    // Plot settings.
    
    // X axis of all distributions.
    var left = 'undefined' === typeof s.left ? 1 : s.left;
    var right = 'undefined' === typeof s.right ? 100 : s.right;
    var padSides = 'undefined' === typeof s.padSides ? 2 : s.padSides;
    
    var nPoints = 'undefined' === typeof s.nPoints ? 100 : s.nPoints;
    var x = jStat.seq(left, right, nPoints);
    var xZeroBased = jStat.seq(0, (nPoints - 1), nPoints);
    
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

    var talentXAxisTitle = 'undefined' !== typeof s.talentXAxisTitle ?
        s.talentXAxisTitle :
        '<b>Mouse over</b> the income distribution to see the ' +
        'level of talent for that person.<br><b>Click</b> ' +
        'to learn about examples about corresponding lifestyle [in the USA].'

    // Var iniatialized later.

    // Plotly traces.
    var income, povertyLine, talent;

    // Normal distribution generator.
    var ynorm;

    // Y axis values.
    var yIncome, yPoverty, yTalent, yIncomeRange;

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
            mapIncome2Talent = J.shuffle(xZeroBased);
            for (i = 0; i < nPoints; ) {
                mapTalent2Income[mapIncome2Talent[i]] = i++;
            }
        }
        else if (mapType === "PERFECT") {
            mapTalent2Income = xZeroBased;
            mapIncome2Talent = xZeroBased;
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

    yIncomeRange = Math.max.apply(null, yIncome.concat([povertyLevel]));
    yIncomeRange = [ 0, yIncomeRange * 1.05 ];

    income = {
        x: x,
        y: yIncome,
        hoverinfo: 'y',
        hoverlabel: {
            font: { size: 18 }
        },
        name: 'Income',
        mode: 'scatter',
        line: {
            color: 'rgb(219, 64, 82)',
            width: 6
        }
    };
    povertyLine = {
        x: x,
        y: yPoverty,
        hoverinfo: 'y',
        hoverlabel: {
            font: { size: 18 }
        },
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
        hoverinfo: 'x',
        hoverlabel: {
            font: { size: 18 }
        },
        name: 'Talent',
        mode: 'lines',
        line: {
            color: '#000',
            width: 8
        },
        xaxis: 'x2',
        yaxis: 'y2'
    };

    data = [ income, povertyLine, talent ];

    layout = {
        hovermode: 'closest',
        title: 'Income Distribution and Talent',
        // legend: {
        //     x: 0.2,
        //     y: 0.9,
        //     traceorder: 'reversed',
        //     font: {size: 16},
        //     yref: 'paper'
        // },
        xaxis: {
            // title: 'People with given income',
            // hoverformat: '.2r'
            range: [ -padSides, right + padSides],
            fixedrange: true
            // autorange: false
        },
        yaxis: {
            title: '<b>Income</b>', // (%) of Total',
            domain: [0.25, 1],
            hoverformat: '.2r',
            range: yIncomeRange,
            fixedrange: true
        },

        yaxis2: {
            title: '<b>Talent</b>',
            domain: [0, 0.2],
            hoverformat: '.2r',
            range: [0, 100],
            // Hide axe.
            showgrid: false,
            zeroline: false,
            showline: false,
            ticks: '',
            showticklabels: false
        },
        xaxis2: {
            anchor: 'y2',
            title: talentXAxisTitle,
            range: [ -padSides, right + padSides],
            // hoverformat: '.2r'
        },
        legend: {
            showlegend: true,
            orientation: s.legendOrientation ? s.legendOrientation : 'v'
        }
    };

    config = {
        editable: false,
        scrollZoom: false,
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
        var points;
        points = getPointsFromEvent(eventData);
        if (!points) return;
        
        Plotly.Fx.hover(myPlot, [
            { curveNumber: 0, pointNumber: points[iIdx] },
            { curveNumber: 2, pointNumber: points[tIdx] }
        ], ['xy', 'x2y2']);
    });

    myPlot.on('plotly_click', function(eventData) {
        var points, annI, annT;
        points = getPointsFromEvent(eventData, { skipTalent: true });
        if (!points) return;

        annI = getAnnotation(eventData.points[0].x,
                             parseFloat(eventData.points[0].y.toPrecision(4)),
                             true);
        annT = getAnnotation((points[tIdx] + 1), yTalent[points[tIdx]]);
        
        Plotly.relayout(myPlot, {
            annotations: [ annI, annT ]
        })
        
        writeExamples(points[iIdx], null, points[tIdx], null);
    });

    // Helper functions.

    function getAnnotation(x, y, income) {
        var out;
        out = {
            x: x,
            y: y,
            font: { size: 14 },
            bgcolor: '#FFF',
            bordercolor: '#000',
            borderpad: 2
            // arrowwidth: 0.5
        };
        if (income) { 
            out.text = 'Income = ' + y;
        }
        else {
            out.text = 'Talent = ' + x;
            out.xref = 'x2';
            out.yref = 'y2';
        }
        return out;
    }
    
    function getPointsFromEvent(eventData, opts) {
        var curve, incomePoint, talentPoint;
        curve = eventData.points[0].curveNumber; 
        
        // Poverty line, do nothing.
        if (curve === 1) return false;

        opts = opts || {};

        // Should I skip others?
        if (opts.skipTalent && curve === 2) return false;       
        
        if (curve === 0) {
            incomePoint = eventData.points[0].pointNumber;
            talentPoint = mapIncome2Talent[incomePoint];
        }
        else {
            talentPoint = eventData.points[0].pointNumber;
            incomePoint = mapTalent2Income[talentPoint];
        }

        // Register action (hover or click).
        actions.push({
            type: eventData.event.type === 'mousedown' ? 'c' : 'h',  
            time: J.now(),
            i: incomePoint,
            t: talentPoint
        });

        return [ incomePoint, talentPoint ];
    }
    
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


    var examples = [
        {
            house: {
                text: 'Live in a mansion of 3000sq with 20acres garden, ' +
                    'several people employed to mantain it, security guards.',
                img: 'house1.jpg'
            },
            commute: {
                text: 'No commute, or commute via private limo',
                img: 'commute1.jpg'
            },
            health: {
                text: 'Can afford any treatment for any curable disease from ' +
                    'the best doctors.',
                img: 'hospital1.jpg'
            },
            vacation: {
                text: 'Anywhere in the world with private and exclusive ' +
                    'residences.',
                img: 'vacation1.jpg'
            },
            school: {
                text: 'Can afford to send his/her children to the best ' +
                    'colleges 100USD+ per year',
                img: 'college1.jpg'
            }
        },


        {
            house: {
                text: 'Live in a private 2floor house with garden.',
                img: 'house2.jpg'
            },
            commute: {
                text: 'Commute by car to work, up to 30minutes.',
                img: 'commute2.jpg'
            },
            health: {
                text: 'Can afford most treatments from the best doctors.',
                img: 'hospital2.jpg',
            },
            vacation: {
                text: 'Anywhere in the world in nice residences.',
                img: 'vacation2.jpg',
            },
            school: {
                text: 'Can afford to send his/her children to' +
                    'colleges 50USD+ per year.',
                img: 'college2.jpg'
            }
        },
        
        {
            house: {
                text: 'Live in private or rented apartment.',
                img: 'house3.jpg'
            },
            commute: {
                text: 'Commute by car to work, 45minutes - 1hour',
                img: 'commute3.jpg'
            },
            health: {
                text: 'Has health insurance, but needs to be careful about ' +
                    'which treatments he/she can afford',
                img: 'hospital3.jpg',
            },
            vacation: {
                text: 'In the state, occasionally to other states',
                img: 'vacation3.jpg',
            },
            school: {
                text: 'Can afford to send his/her children to' +
                    'public colleges or private 10kUSD+ per year',
                img: 'college3.jpg'
            }
        },
        
        {
            house: {
                text: 'Rent a small apartment or a small house in a periferic ' +
                    'area.',
                img: 'house4.jpg'
            },
            commute: {
                text: 'Commute by car or public transport when available ' +
                    'to work, 1hour-1hour30minutes',
                img: 'commute4.jpg'
            },
            health: {
                text: 'Has medicare insurance.',
                img: 'hospital4.png',
            },
            vacation: {
                text: 'Occasional trips within the state.',
                img: 'vacation4.jpg',
            },
            school: {
                text: 'Cannot afford to pay college education to children.',
                img: 'no_college.jpg'
            }
        },
        
        {
            house: {
                text: 'Homeless or public shelters.',
                img: 'no_house.jpg'
            },
            commute: {
                text: 'No job.',
                img: 'no_job.png'
            },
            health: {
                text: 'No insurance.',
                img: 'no_hospital.jpg',
            },
            vacation: {
                text: 'No vacations.',
                img: 'no_vacation.jpg'
            },
            school: {
                text: 'Cannot afford to pay college education to children.',
                img: 'no_college.jpg'
            }
        }
    ];

    // TODO: write closure.
    var houseText, houseImg, commuteText, commuteImg,
        healthText, healthImg, vacationText, vacationImg,
        schoolText, schoolImg;

    houseText = document.getElementById('house-text-td');
    houseImg = document.getElementById('house-img');
    commuteText = document.getElementById('commute-text-td');
    commuteImg = document.getElementById('commute-img');
    healthText = document.getElementById('health-text-td');
    healthImg = document.getElementById('health-img');
    vacationText = document.getElementById('vacation-text-td');
    vacationImg = document.getElementById('vacation-img');
    schoolText = document.getElementById('school-text-td');
    schoolImg = document.getElementById('school-img');
    
    function writeExamples(xIncome, yIncome, xTalent, yTalent) {
        var idxIncome, ref;

        idxIncome = mapIncomeToExamples(xIncome, yIncome);
        // idxIncome = 0;
        ref = examples[idxIncome];

        houseText.innerHTML = ref.house.text;
        houseImg.src = 'imgs/' + ref.house.img;
        commuteText.innerHTML = ref.commute.text;
        commuteImg.src = 'imgs/' + ref.commute.img;
        healthText.innerHTML = ref.health.text;
        healthImg.src = 'imgs/' + ref.health.img;
        vacationText.innerHTML = ref.vacation.text;
        vacationImg.src = 'imgs/' + ref.vacation.img;
        schoolText.innerHTML = ref.school.text;
        schoolImg.src = 'imgs/' + ref.school.img;
    }

    // var rotate = -1;
    function mapIncomeToExamples(xIncome, yIncome) {
        // debugger
        // rotate++;
        // if (rotate >= examples.length) rotate = 0;
        // return rotate; //J.randomInt(-1, (examples.length - 1));
        // if (xIncome === 0) return 4;
        return Math.floor(5 - ((xIncome + 1) / (nPoints / 5)));
    }
}

function simulateTalent(collection) {
    for (var i = 0; i < collection.length; i++) {
        
    }
}
