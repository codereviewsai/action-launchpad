"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranch = exports.isPullRequest = exports.resetPullDescription = exports.prependToPullDescription = exports.appendToPullDescription = void 0;
const github = __importStar(require("@actions/github"));
const _ = __importStar(require("lodash"));
// eslint-disable-next-line no-unused-vars
const MARK_BN_TOP_START = '[//]: # (bn-top-start)';
const MARK_BN_TOP_END = '[//]: # (bn-top-end)';
const MARK_BN_BOTTOM_START = '[//]: # (bn-bottom-start)';
// eslint-disable-next-line no-unused-vars
const MARK_BN_BOTTOM_END = '[//]: # (bn-bottom-end)';
// Utils
// -----
async function updatePullRequest(updater) {
    const branch = getBranch();
    const source = github.context.ref.replace(/^refs\/heads\//, '');
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const { data: pulls } = await octokit.rest.pulls.list({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        base: branch,
        head: `${github.context.repo.owner}:${source}`
    });
    if (pulls.length === 0) {
        throw new Error(`No such pull request for branch: ${branch}`);
    }
    const pullRequest = pulls[0];
    await octokit.rest.pulls.update({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: pullRequest.number,
        body: updater(pullRequest.body)
    });
}
function cleanDescription(description) {
    return _.chain(description)
        .trimStart(MARK_BN_TOP_END)
        .trimEnd(MARK_BN_BOTTOM_START)
        .value();
}
// Public Methods
// -----
async function appendToPullDescription(description) {
    await updatePullRequest((currentDescription) => {
        return `
${description}
${cleanDescription(currentDescription || '')}    
`;
    });
}
exports.appendToPullDescription = appendToPullDescription;
async function prependToPullDescription(description) {
    await updatePullRequest((currentDescription) => {
        return `
${cleanDescription(currentDescription || '')}    
${description}
`;
    });
}
exports.prependToPullDescription = prependToPullDescription;
async function resetPullDescription() {
    await updatePullRequest((currentDescription) => cleanDescription(currentDescription || ''));
}
exports.resetPullDescription = resetPullDescription;
function isPullRequest() {
    return true;
}
exports.isPullRequest = isPullRequest;
function getBranch() {
    return _.replace(github.context.ref, 'refs/heads/', '');
}
exports.getBranch = getBranch;
//# sourceMappingURL=github.js.map