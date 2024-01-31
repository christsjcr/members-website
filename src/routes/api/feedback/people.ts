// Committee members that can reveal the identities of anonymous form submissions,
// all of which will be alerted if such a reveal occurs
const valid_revealers = {
    sim36: "president",
    // "vicepresident"
    bjr43: "treasurer",
    cd796: "secretary",
    za325: "welfare-m",
    cl986: "welfare-f",
    wyrt2: "webmaster",
};

// Committee members that can respond to form submissions
const valid_responders = {
    ...valid_revealers,
    // "ents"
    fm597: "firstyearrep",
    mc2374: "classact",
    mda54: "edo",
    eh721: "womens",
    ap2330: "intl",
    dw644: "lgbt",
    gv310: "access",
    ab2899: "facilities",
    mykk2: "green",
};

// Committee members that can be selected under the "Share With: Specific officers only" option
const valid_recipients = Array.from(new Set(Object.values(valid_responders)));

const exec_recipients = [
    "president",
    "vicepresident",
    "welfare-f",
];


// Committee members that will receive submissions of type "Share With: Committee"
const committee_recipients = [
    ...exec_recipients,
    "webmaster",
    "womens",
    "ents"
];

export { valid_revealers, valid_responders, valid_recipients, committee_recipients, exec_recipients };
