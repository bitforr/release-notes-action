/** Default release heading prefix */
export declare const RELEASE_HEADING_PREFIX = "^## \\[?";
/** Default release heading suffix */
export declare const RELEASE_HEADING_SUFFIX = "[\\] ]";
/** Action's input name */
export declare enum InputName {
    CHANGELOG_FILE = "changelog-file",
    RELEASE_NOTES_FILE = "release-notes-file",
    RELEASE_VERSION = "release-version",
    RELEASE_HEADING_PREFIX = "release-heading-prefix",
    RELEASE_HEADING_SUFFIX = "release-heading-suffix"
}
/** Action's output name */
export declare enum OutputName {
    RELEASE_NOTES = "release-notes"
}
