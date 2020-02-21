const _ = require('lodash');
const htmlTags = require('html-tags');

const basic = /\s?<!doctype html>|(<html\b[^>]*>|<body\b[^>]*>|<x-[^>]+>)+/i;
const full = new RegExp(htmlTags.map(tag => `<${tag}\\b[^>]*>`).join('|'), 'i');

module.exports = function isHtml(string) {
  return basic.test(string) || full.test(string);
};
