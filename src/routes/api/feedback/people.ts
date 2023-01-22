// Committee members that can reveal the identities of anonymous form submissions,
// all of which will be alerted if such a reveal occurs
const valid_revealers = {
    ov235: "president",
    cl888: "vicepresident",
    fpk24: "treasurer",
    cd796: "secretary",
    jl2323: "welfare-m",
    om377: "welfare-f",
    mtw43: "webmaster",
};

// Committee members that can respond to form submissions
const valid_responders = {
    ...valid_revealers,
    np578: "ents",
    qd227: "firstyearrep",
    kb786: "classact",
    aa2315: "edo",
    ams315: "womens",
    jyt33: "intl",
    // "lgbt",
    yld21: "access",
    mr936: "facilities",
    red50: "green",
};

// Committee members that can be selected under the "Share With: Specific officers only" option
const valid_recipients = Array.from(new Set(Object.values(valid_responders)));
valid_recipients.push("lgbt");

// Committee members that will receive submissions of type "Share With: Committee"
const misc_recipients = [
    "webmaster",
];

export { valid_revealers, valid_responders, valid_recipients, misc_recipients };
