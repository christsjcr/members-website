const valid_responders = {
    ov235: "president",
    cl888: "vicepresident",
    fpk24: "treasurer",
    cd796: "secretary",
    jl2323: "welfare-m",
    om377: "welfare-f",
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
    mtw43: "webmaster",
};

const valid_recipients = new Set(Object.values(valid_responders));
valid_recipients.add("lgbt");

export { valid_responders, valid_recipients };
