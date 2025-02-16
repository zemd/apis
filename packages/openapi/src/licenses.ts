export type LicenseIdentifier = keyof typeof OpenSourceLicenses;

// The same as GitHub support for license metadata
// see https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
export const OpenSourceLicenses = {
  "AFL-3.0": {
    name: "Academic Free License v3.0",
    short: "AFL 3.0",
    url: "https://opensource.org/licenses/AFL-3.0",
  },
  "Apache-2.0": {
    name: "Apache License 2.0",
    short: "Apache 2.0",
    url: "https://www.apache.org/licenses/LICENSE-2.0",
  },
  "Artistic-2.0": {
    name: "Artistic License 2.0",
    short: "Artistic 2.0",
    url: "https://opensource.org/licenses/Artistic-2.0",
  },
  "BSL-1.0": {
    name: "Boost Software License 1.0",
    short: "BSL 1.0",
    url: "https://opensource.org/licenses/BSL-1.0",
  },
  "BSD-2-Clause": {
    name: "BSD 2-Clause 'Simplified' License",
    short: "BSD 2-Clause",
    url: "https://opensource.org/licenses/BSD-2-Clause",
  },
  "BSD-3-Clause": {
    name: "BSD 3-Clause 'New' or 'Revised' License",
    short: "BSD 3-Clause",
    url: "https://opensource.org/licenses/BSD-3-Clause",
  },
  "BSD-3-Clause-Clear": {
    name: "BSD 3-Clause Clear License",
    short: "BSD 3-Clause Clear",
    url: "https://opensource.org/licenses/BSD-3-Clause-Clear",
  },
  "BSD-4-Clause": {
    name: "BSD 4-Clause 'Original' or 'Old' License",
    short: "BSD 4-Clause",
    url: "https://opensource.org/licenses/BSD-4-Clause",
  },
  "0BSD": {
    name: "BSD Zero Clause License",
    short: "0BSD",
    url: "https://opensource.org/licenses/0BSD",
  },
  CC: {
    name: "Creative Commons",
    short: "CC",
    url: "https://creativecommons.org/licenses/",
  },
  "CC0-1.0": {
    name: "Creative Commons Zero v1.0 Universal",
    short: "CC0 1.0",
    url: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  "CC-BY-4.0": {
    name: "Creative Commons Attribution 4.0",
    short: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  "CC-BY-SA-4.0": {
    name: "Creative Commons Attribution-ShareAlike 4.0",
    short: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  WTFPL: {
    name: "Do What The F*ck You Want To Public License",
    short: "WTFPL",
    url: "https://en.wikipedia.org/wiki/WTFPL",
  },
  "ECL-2.0": {
    name: "Eclipse Public License 2.0",
    short: "EPL 2.0",
    url: "https://opensource.org/licenses/EPL-2.0",
  },
  "EPL-1.0": {
    name: "Eclipse Public License 1.0",
    short: "EPL 1.0",
    url: "https://opensource.org/licenses/EPL-1.0",
  },
  "EPL-2.0": {
    name: "Eclipse Public License 2.0",
    short: "EPL 2.0",
    url: "https://opensource.org/licenses/EPL-2.0",
  },
  "EUPL-1.1": {
    name: "European Union Public License 1.1",
    short: "EUPL 1.1",
    url: "https://opensource.org/licenses/EUPL-1.1",
  },
  "AGPL-3.0": {
    name: "GNU Affero General Public License v3.0",
    short: "AGPL 3.0",
    url: "https://opensource.org/licenses/AGPL-3.0",
  },
  GPL: {
    name: "GNU General Public License",
    short: "GPL",
    url: "https://opensource.org/licenses/GPL-3.0",
  },
  "GPL-2.0": {
    name: "GNU General Public License 2.0",
    short: "GPL 2.0",
    url: "https://opensource.org/licenses/GPL-2.0",
  },
  "GPL-3.0": {
    name: "GNU General Public License 3.0",
    short: "GPL 3.0",
    url: "https://opensource.org/licenses/GPL-3.0",
  },
  LGPL: {
    name: "GNU Lesser General Public License",
    short: "LGPL",
    url: "https://opensource.org/licenses/LGPL-3.0",
  },
  "LGPL-2.1": {
    name: "GNU Lesser General Public License 2.1",
    short: "LGPL 2.1",
    url: "https://opensource.org/licenses/LGPL-2.1",
  },
  "LGPL-3.0": {
    name: "GNU Lesser General Public License 3.0",
    short: "LGPL 3.0",
    url: "https://opensource.org/licenses/LGPL-3.0",
  },
  ISC: {
    name: "ISC License",
    short: "ISC",
    url: "https://opensource.org/licenses/ISC",
  },
  "LPPL-1.3c": {
    name: "LaTeX Project Public License v1.3c",
    short: "LPPL 1.3c",
    url: "https://latex-project.org/lppl/",
  },
  "MS-PL": {
    name: "Microsoft Public License",
    short: "MS-PL",
    url: "https://opensource.org/licenses/MS-PL",
  },
  MIT: {
    name: "MIT License",
    short: "MIT",
    url: "https://opensource.org/licenses/MIT",
  },
  "MPL-2.0": {
    name: "Mozilla Public License 2.0",
    short: "MPL 2.0",
    url: "https://opensource.org/licenses/MPL-2.0",
  },
  "OSL-3.0": {
    name: "Open Software License 3.0",
    short: "OSL 3.0",
    url: "https://opensource.org/licenses/OSL-3.0",
  },
  PostgreSQL: {
    name: "PostgreSQL License",
    short: "PostgreSQL",
    url: "https://opensource.org/licenses/PostgreSQL",
  },
  "OFL-1.1": {
    name: "SIL Open Font License 1.1",
    short: "OFL 1.1",
    url: "https://opensource.org/licenses/OFL-1.1",
  },
  NCSA: {
    name: "University of Illinois/NCSA Open Source License",
    short: "NCSA",
    url: "https://opensource.org/licenses/NCSA",
  },
  Unlicense: {
    name: "The Unlicense",
    short: "Unlicense",
    url: "https://unlicense.org/",
  },
  Zlib: {
    name: "The zlib/libpng License",
    short: "Zlib",
    url: "https://opensource.org/licenses/Zlib",
  },
} as const;
