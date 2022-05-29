/*
 *
 * HomePage
 *
 */

import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import * as d3 from "d3";
import React, {
    Component
} from 'react';
import axios from 'axios'
import {
    Element
} from 'react-faux-dom';

class App extends Component {

    state = {
        pieChartData: [],
        barChartData: [],
        persons: []
    }

    plotBarChart(chart, width, height) {
        // create scales!
        const xScale = d3.scaleBand()
            .domain(this.state.barChartData.map(d => d.attributes.Country))
            .range([0, width]);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.state.barChartData, d =>
d.attributes.Spending)])
            .range([height, 0]);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        chart.selectAll('.bar')
            .data(this.state.barChartData)
            .enter()
            .append('rect')
            .classed('bar', true)
            .attr('x', d => xScale(d.attributes.Country))
            .attr('y', d => yScale(d.attributes.Spending))
            .attr('height', d => (height - yScale(d.attributes.Spending)))
            .attr('width', d => xScale.bandwidth())
            .style('fill', (d, i) => colorScale(i));

        chart.selectAll('.bar-label')
            .data(this.state.barChartData)
            .enter()
            .append('text')
            .classed('bar-label', true)
            .attr('x', d => xScale(d.attributes.Country) + xScale.bandwidth() / 2)
            .attr('dx', 0)
            .attr('y', d => yScale(d.attributes.Spending))
            .attr('dy', -6)
            .text(d => d.attributes.Spending);

        const xAxis = d3.axisBottom()
            .scale(xScale);

        chart.append('g')
            .classed('x axis', true)
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        const yAxis = d3.axisLeft()
            .ticks(5)
            .scale(yScale);

        chart.append('g')
            .classed('y axis', true)
            .attr('transform', 'translate(0,0)')
            .call(yAxis);

        chart.select('.x.axis')
            .append('text')
            .attr('x', width / 2)
            .attr('y', 60)
            .attr('fill', '#000')
            .style('font-size', '20px')
            .style('text-anchor', 'middle')
            .text('Country');

        chart.select('.y.axis')
            .append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('transform', `translate(-50, ${height/2}) rotate(-90)`)
            .attr('fill', '#000')
            .style('font-size', '20px')
            .style('text-anchor', 'middle')
            .text('Spending in Billion Dollars');

        const yGridlines = d3.axisLeft()
            .scale(yScale)
            .ticks(5)
            .tickSize(-width, 0, 0)
            .tickFormat('')

        chart.append('g')
            .call(yGridlines)
            .classed('gridline', true);
    }

    plotPieChart(chart, width, height) {

        const radius = Math.min(width, height) / 2;


        const g = chart
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(["gray", "green", "brown"]);

        const pie = d3.pie().value(function(d) {
            return d.attributes.Percentage;
        });

        const path = d3
            .arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        const label = d3
            .arc()
            .outerRadius(radius)
            .innerRadius(radius - 80);

        const arc = g
            .selectAll(".arc")
            .data(pie(this.state.pieChartData))
            .enter()
            .append("g")
            .attr("class", "arc");

        arc
            .append("path")
            .attr("d", path)
            .attr("fill", function(d) {
                return color(d.data.attributes.State);
            });

        arc
            .append("text")
            .attr("transform", function(d) {
                return `translate(${label.centroid(d)})`;
            })
            .text(function(d) {
                return d.data.attributes.State;
            });

        chart
            .append("g")
            .attr("transform", `translate(${width / 2 - 120},20)`)
            .append("text")
            .text("Top populated states in the US")
            .attr("class", "title");
    }

    drawChart() {
        const width = 400;
        const height = 450;
        const el = new Element('div');
        const el2 = new Element('div');

        const margin = {
            top: 60,
            bottom: 100,
            left: 80,
            right: 40
        };

        const svg = d3.select(el)
            .append('svg')
            .attr('id', 'barchart')
            .attr('width', width)
            .attr('height', height);


        const barchart = svg.append('g')
            .classed('display', true)
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const margin2 = {
            top: 60,
            bottom: 100,
            left: 80,
            right: 40
        };

        const svg2 = d3.select(el)
            .append('svg')
            .attr('id', 'piechart')
            .attr('width', width)
            .attr('height', height);


        const piechart = svg2.append('g')
            .classed('display', true)
            .attr('transform', `translate(${margin2.left},${margin2.top})`);


        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom

        const chartWidth2 = width - margin2.left - margin2.right;
        const chartHeight2 = height - margin2.top - margin2.bottom

        this.plotBarChart(barchart, chartWidth, chartHeight);
        this.plotPieChart(piechart, chartWidth2, chartHeight2);
        return el.toReact();
    }


    componentDidMount() {

        axios.get('http://localhost:1337/api/statistics').then((response) => {
            console.log(response.data.data);
            const barChartData = response.data.data;
            this.setState({
                barChartData
            });
        }, (error) => {
            console.log("No data seen at endpoint");
            console.log(error);
        });

        axios.get('http://localhost:1337/api/ratios').then((response) => {
            console.log(response.data.data);
            const pieChartData = response.data.data;
            this.setState({
                pieChartData
            });
        }, (error) => {
            console.log("No data seen at endpoint");
            console.log(error);
        });

    }

    render() {
        return this.drawChart();
    }
}

export default App;
