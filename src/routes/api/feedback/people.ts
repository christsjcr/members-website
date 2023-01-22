const valid_revealers = {
    ov235: "president",
    cl888: "vicepresident",
    fpk24: "treasurer",
    cd796: "secretary",
    jl2323: "welfare-m",
    om377: "welfare-f",
    mtw43: "webmaster",
};

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

const misc_recipients = [
    "webmaster",
];

const valid_recipients = Array.from(new Set(Object.values(valid_responders)));
valid_recipients.push("lgbt");

export { valid_revealers, valid_responders, valid_recipients, misc_recipients };
