fn main(num_writes: Field, num_pastes: pub Field) {
    assert(num_writes as u32 > num_pastes as u32);
}

#[test]
fn test_main() {
    main(2, 1);
}
