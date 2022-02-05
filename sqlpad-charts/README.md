# helm charts for sqlpad 

3 steps to use this chart 

### First 

clone git repository and change directory 

```code
git clone https://github.com/sqlpad/sqlpad.git && cd sqlpad/sqlpad-charts
```

### Second 

update dependency 

```shell
helm dependency update
```

### Third

install this chart locally

```code
helm -n sqlpad install sqlpad ./
```

You should create namespace ahead or you can use flag `--create-namespace` to create namespace sqlpad