"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var puppeteer = require("puppeteer");
var express = require("express");
var pdf_lib_1 = require("pdf-lib");
var WritableStream = require('memory-streams').WritableStream;
var fs = require('fs');
var generatedPdfBuffers = [];
function mergePdfBuffers(pdfBuffers) {
    return __awaiter(this, void 0, void 0, function () {
        var outDoc, _i, pdfBuffers_1, pdfBuffer, docToAdd, pages, _a, pages_1, page;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, pdf_lib_1.PDFDocument.create()];
                case 1:
                    outDoc = _b.sent();
                    _i = 0, pdfBuffers_1 = pdfBuffers;
                    _b.label = 2;
                case 2:
                    if (!(_i < pdfBuffers_1.length)) return [3 /*break*/, 6];
                    pdfBuffer = pdfBuffers_1[_i];
                    return [4 /*yield*/, pdf_lib_1.PDFDocument.load(pdfBuffer)];
                case 3:
                    docToAdd = _b.sent();
                    return [4 /*yield*/, outDoc.copyPages(docToAdd, docToAdd.getPageIndices())];
                case 4:
                    pages = _b.sent();
                    for (_a = 0, pages_1 = pages; _a < pages_1.length; _a++) {
                        page = pages_1[_a];
                        outDoc.addPage(page);
                    }
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, outDoc.save()];
            }
        });
    });
}
;
var getURL = function (origin, filePath) {
    return origin + "/" + filePath.substring(filePath.startsWith('/') ? 1 : 0);
};
var getStylesheetPathFromHTML = function (html, origin) {
    var regExp = /(?:|<link.*){1}href="(.*styles.*?\.css){1}"/g;
    var filePath = "";
    try {
        filePath = getFirstCapturingGroup(regExp, html);
    }
    catch (_a) {
        throw new Error("The href attribute of the 'styles*.css' file could not be found!");
    }
    return getURL(origin, filePath);
};
var getScriptPathFromHTML = function (html, origin) {
    var regExp = /(?:|<script.*){1}src="(.*styles.*?\.js){1}"/g;
    var filePath = "";
    try {
        filePath = getFirstCapturingGroup(regExp, html);
    }
    catch (_a) {
        throw new Error("The src attribute of the 'styles*.js' file could not be found!");
    }
    return getURL(origin, filePath);
};
var getFirstCapturingGroup = function (regExp, text) {
    var match = regExp.exec(text);
    if (match && match[1]) {
        return match[1];
    }
    else {
        throw new ReferenceError("No capture group found in the provided text.");
    }
};
var isAddressInfo = function (arg) {
    return arg
        && arg.address && typeof (arg.address) == 'string'
        && arg.family && typeof (arg.family) == 'string'
        && arg.port && typeof (arg.port) == 'number';
};
var getPathSegment = function (path, slashIfEmpty) {
    if (slashIfEmpty === void 0) { slashIfEmpty = true; }
    if (path && !path.trim().startsWith('/')) {
        return '/' + path.trim();
    }
    else if (!path && slashIfEmpty) {
        return '/';
    }
    else {
        return '';
    }
};
function generatePdf(initialDocsUrl, filename, puppeteerArgs) {
    if (filename === void 0) { filename = "docusaurus.pdf"; }
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, url, origin, stylePath, scriptPath, nextPageUrl, e_1, html, pdfBuffer, mergedPdfBuffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer.launch({ args: puppeteerArgs })];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    url = new URL(initialDocsUrl);
                    origin = url.origin;
                    stylePath = "";
                    scriptPath = "";
                    nextPageUrl = initialDocsUrl;
                    _a.label = 3;
                case 3:
                    if (!nextPageUrl) return [3 /*break*/, 14];
                    console.log();
                    console.log(chalk.cyan("Generating PDF of " + nextPageUrl));
                    console.log();
                    return [4 /*yield*/, page.goto("" + nextPageUrl, { waitUntil: 'networkidle2' })
                            .then(function (resp) { return resp === null || resp === void 0 ? void 0 : resp.text(); })
                            .then(function (html) {
                            if (!html)
                                throw new Error("Page could not be loaded! Did not get any HTML for " + nextPageUrl);
                            stylePath = getStylesheetPathFromHTML(html, origin);
                            scriptPath = getScriptPathFromHTML(html, origin);
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, page.$eval('.pagination-nav__item--next > a', function (element) {
                            return element.href;
                        })];
                case 6:
                    nextPageUrl = _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _a.sent();
                    nextPageUrl = "";
                    return [3 /*break*/, 8];
                case 8: return [4 /*yield*/, page.$eval('article', function (element) {
                        return element.outerHTML;
                    })];
                case 9:
                    html = _a.sent();
                    return [4 /*yield*/, page.setContent(html)];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, page.addStyleTag({ url: stylePath })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, page.addScriptTag({ url: scriptPath })];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, page.pdf({ path: "", format: 'A4', printBackground: true, margin: { top: 25, right: 35, left: 35, bottom: 25 } })];
                case 13:
                    pdfBuffer = _a.sent();
                    generatedPdfBuffers.push(pdfBuffer);
                    console.log(chalk.green("Success"));
                    return [3 /*break*/, 3];
                case 14: return [4 /*yield*/, browser.close()];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, mergePdfBuffers(generatedPdfBuffers)];
                case 16:
                    mergedPdfBuffer = _a.sent();
                    fs.writeFileSync("" + filename, mergedPdfBuffer);
                    return [2 /*return*/];
            }
        });
    });
}
exports.generatePdf = generatePdf;
function generatePdfFromBuildSources(buildDirPath, firstDocPath, baseUrl, filename, puppeteerArgs) {
    if (filename === void 0) { filename = "docusaurus.pdf"; }
    return __awaiter(this, void 0, void 0, function () {
        var app, httpServer, address;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = express();
                    baseUrl = getPathSegment(baseUrl, false);
                    firstDocPath = getPathSegment(firstDocPath);
                    return [4 /*yield*/, app.listen()];
                case 1:
                    httpServer = _a.sent();
                    address = httpServer.address();
                    if (!address || !isAddressInfo(address)) {
                        httpServer.close();
                        throw new Error("Something went wrong spinning up the express webserver.");
                    }
                    app.use(baseUrl, express.static(buildDirPath));
                    return [4 /*yield*/, generatePdf("http://127.0.0.1:" + address.port + baseUrl + firstDocPath, filename, puppeteerArgs)
                            .then(function () { return httpServer.close(); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.generatePdfFromBuildSources = generatePdfFromBuildSources;
