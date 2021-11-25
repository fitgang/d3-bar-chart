const svg = d3.select("svg");

// default size and orientation of svg
let width = 1000,
    height = 500,
    padding = 40,
    rotate = false;

// if screen width is not adequate, then change display
if (innerWidth < width) {
    // not even '625px'
    if (innerWidth < 625) {
        // then display the visual vertically
        rotate = true;
        height = width;
        padding = 45;

        setTimeout(() => {
            alert("Open on a computer system for better view.");
            alert("Click on a bar for details.")
        }, 5000);
    }
    width = (innerWidth * 4) / 5;
}

svg.attr("width", width);
svg.attr("height", height);

d3.json(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
).then((data) => {
    // metadata

    // title
    d3.select("h1").text(data.name);

    // descriptio
    d3.select("p").text(data.description);

    // source
    svg
        .append("text")
        .attr("x", rotate ? 5 : padding)
        .attr("y", rotate ? padding : height - 5)
        .text(`SOURCE: ${data["source_name"]}`)
        .classed("vertical-text", rotate);

    // Y axis label
    svg
        .append("text")
        .attr("x", rotate ? padding : padding + 20)
        .attr("y", rotate ? 10 : padding)
        .text("GDP (in $ Billion)")
        .style("transform", rotate ? "" : "translate(20px, 215px) rotate(-90deg)");

    const dataset = data.data;
    const xScale = d3
        .scaleTime()
        .domain([new Date(data["from_date"]), new Date(data["to_date"])])
        .range(rotate ? [0, height - padding] : [padding, width - padding]),
        yAxisScale = d3
        .scaleLinear()
        .domain([0, d3.max(dataset, (d) => d[1])])
        .range(rotate ? [padding, width] : [height - padding, 0]),
        yScale = d3
        .scaleLinear()
        .domain([0, d3.max(dataset, (d) => d[1])])
        .range(rotate ? [0, width - padding] : [0, height - padding]);

    const xAxis = rotate ? d3.axisLeft(xScale) : d3.axisBottom(xScale),
        yAxis = rotate ? d3.axisTop(yAxisScale) : d3.axisLeft(yAxisScale);

    svg
        .append("g")
        .attr("id", "x-axis")
        .attr(
            "transform",
            rotate ?
            `translate(${padding}, ${padding})` :
            `translate(0, ${height - padding})`
        )
        .call(xAxis);
    svg
        .append("g")
        .attr("id", "y-axis")
        .attr(
            "transform",
            rotate ? `translate(0, ${padding})` : `translate(${padding}, 0)`
        )
        .call(yAxis);

    const barWidth = rotate ?
        (height - padding) / dataset.length :
        (width - padding) / dataset.length;
    const bars = svg
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .style("transform", "scaleY(0)")
        .attr("class", "bar")
        .attr("index", (d, i) => i)
        .attr("data-date", (d) => d[0])
        .attr("data-gdp", (d) => d[1])
        .attr("x", rotate ? padding : (d) => xScale(new Date(d[0])))
        .attr("y", rotate ? (d) => padding + xScale(new Date(d[0])) : (d) => height - padding - yScale(d[1]))
        .attr("width", rotate ? (d) => yScale(d[1]) : barWidth)
        .attr("height", rotate ? barWidth : (d) => yScale(d[1]));

    bars
        .transition()
        .delay((d, i) => i * 10)
        .duration((d, i) => i)
        .style("transform", "scaleY(1)");

    /*
    'tt' for tooltip
    'M'- margin for tt
    'Bg'- background
    'C'- coordinates
    'D'- dimensions
    */
    const ttM = {
            x: 10,
            y: 22
        },
        ttBgD = {
            w: (2 * ttM.x) + 108,
            h: (2 * ttM.y) + 15
        };
    let ttC = {
        x: rotate ? width / 2 : 0,
        y: rotate ? 0 : (height * 3) / 4
    };

    const ttBg = svg
        .append("rect")
        .attr("id", "tooltip-bg")
        .attr("width", ttBgD.w)
        .attr("height", ttBgD.h)
        .style("opacity", 0),
        tooltip = svg.append("text").attr("id", "tooltip").attr("font-size", "1.25em");

    if (rotate) {
        tooltip.attr("x", ttC.x);
        ttBg.attr("x", ttC.x - ttM.x);
    } else {
        tooltip.attr("y", ttC.y);
        ttBg.attr("y", ttC.y - ttM.y);
    }

    bars
        .on("mouseover", function(e, d) {
            const bar = d3.select(this);
            const space = 20; /* btw bar and tooltip */

            if (rotate) {
                let y = Number.parseInt(bar.attr("y")) - ttBgD.h;
                if (y - ttM.y <= padding) {
                    y = y + ttBgD.h + ttM.y + 20;
                }
                tooltip
                    .attr("y", y)
                    .html(
                        `${getQuarter(d[0])}
                <tspan x=${ttC.x} y=${y + 25}>$${d[1]} B</tspan>`
                    );

                ttBg.attr("y", y - ttM.y);
            } else {
                let x = Number.parseInt(bar.attr("x")) + space;
                if (x >= width - ttBgD.w) {
                    x = x - space - ttBgD.w - 4;
                }
                tooltip
                    .attr("x", x)
                    .html(
                        `${getQuarter(d[0])}
                <tspan x=${x} y=${ttC.y + 25}>$${d[1]} B</tspan>`
                    );

                ttBg.attr("x", x - ttM.x);
            }

            tooltip.style("opacity", 1).attr("data-date", d[0]);
            ttBg.style("opacity", 1);
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
            ttBg.style("opacity", 0);
        });
});

function getQuarter(dateString) {
    const year = dateString.slice(0, 4),
        month = dateString.slice(5, 7);
    switch (month) {
        case "01":
            return `${year} Q1`;
        case "04":
            return `${year} Q2`;
        case "07":
            return `${year} Q3`;
        default:
            return `${year} Q4`;
    }
}
