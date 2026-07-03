const React = require('react');
const Tamilnadu = require('svgmap-tamilnadu');

let element = Tamilnadu.default({});

// Recursively render function components
while (typeof element.type === 'function') {
  element = element.type(element.props);
}

console.log('Final element Type:', element.type);
console.log('Final element Props keys:', Object.keys(element.props));
const svgElement = element.props.children;
console.log('SVG Type:', svgElement.type);
console.log('SVG viewBox:', svgElement.props.viewBox);
console.log('Paths count:', svgElement.props.children.length);
console.log('First path ID:', svgElement.props.children[0].props.id);
