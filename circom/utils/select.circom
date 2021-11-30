/* select k(input) from args[N] */
template Select() {
    signal input sel;
    signal input in[4];
    signal output out;
    signal r1, r2, r3, r4;
    (sel-2) * (sel-3) * (sel-4) === r1 * (-6);
    r1 <-- -(sel-2) * (sel-3) * (sel-4)/6;
    (sel-1) * (sel-3) * (sel-4) === r2 * 2;
    r2 <-- (sel-1) * (sel-3) * (sel-4)/2;
    (sel-1) * (sel-2) * (sel-4) === r3 * (-2);
    r3 <-- -(sel-1) * (sel-2) * (sel-4)/2;
    (sel-1) * (sel-2) * (sel-3) === r4 * 6;
    r4 <-- (sel-1) * (sel-2) * (sel-3)/6;
    out <== r1 * in[0] + r2 * in[1] + r3 * in[2] + r4 * in[3];
}
