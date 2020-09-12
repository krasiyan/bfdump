import SerialPort from "serialport";
import { createDeferredPromise, DeferredPromise } from "./helpers";

export const dumpData = async (): Promise<string[]> => {
  const serialport = new SerialPort("/dev/ttyACM0", {
    baudRate: 11520,
  });
  const parser = serialport.pipe(
    new SerialPort.parsers.Readline({ delimiter: "\r\n" })
  );

  const dataDump: string[] = [];
  const cliModeEnabled: DeferredPromise = createDeferredPromise();
  const dataDumped: DeferredPromise = createDeferredPromise();

  parser.on("data", (line) => {
    if (
      line === "#" ||
      line === "Entering CLI Mode, type 'exit' to return, or 'help'"
    ) {
      cliModeEnabled.resolve();
      return;
    }

    if (line === "batch end") {
      dataDumped.resolve();
      return;
    }

    if (cliModeEnabled.isResolved && !dataDumped.isResolved) {
      dataDump.push(line);
    }
  });

  serialport.write("#\n");
  await cliModeEnabled.promise;
  serialport.write("dump\n");
  await dataDumped.promise;

  return dataDump;
};
