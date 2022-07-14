# change unit test json here (For now)
npx tsc
for folder in "tests" ; do
    for file in $folder/*"tests"/* ; do
        filename=$(echo ${file##*/} | cut  -d'.' -f 1);
        node ../../../dist/circom/tools/CircomTestTool/main.js "${file}" "$filename" $1
    done
done