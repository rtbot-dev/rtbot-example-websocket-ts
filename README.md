# rtbot-example-websocket-ts

A more elaborated example about using RtBot in a real life scenario

## Run

```shell
# install dependencies
pnpm install
# run
pnpm start
```
Notice that currently you need to wait around 50 seconds to see some data out.

## Description

This program gets the data in real time from [binance.com](https://binance.com)
for the ETH/USDT pair through a websocket connection and feeds it to the `rtbot`
program instance defined in the `rtbot-program.yaml` file. The program computes the upper and
lower Bollinger Bands with 50 periods and 2 sigma width. Whenever the current
value goes above the upper band the program prints a `+` and similarly when it
goes below the lower band prints a `-` symbol. The example shows how to define
an `rtbot` program, how to embed it into a javascript application, and how to
take actions according to the output obtained from the `rtbot` program instance.

Here we use [NestJS](https://www.nestjs.com) framework to build this sample app,
but there is no reason why not to use any other popular framework though.
