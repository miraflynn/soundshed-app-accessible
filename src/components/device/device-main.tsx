import React, { useEffect } from "react";
import { Utils } from "../../core/utils";
import { DeviceStateStore } from "../../stores/devicestate";
import {
  appViewModel,
  AppViewModelContext,
  deviceViewModel as vm,
} from "../app";
import DeviceControls from "./device-controls";
import MiscControls from "./misc-controls";
import SignalPathControl from "./signal-path";

const DeviceMainControl = () => {
  const deviceViewModel = vm;

  const onViewModelStateChange = () => {
    //setDevices(deviceViewModel.devices);
  };

  const connectionInProgress = DeviceStateStore.useState(
    (s) => s.isConnectionInProgress
  );
  const connected: boolean = DeviceStateStore.useState((s) => s.isConnected);
  const devices = DeviceStateStore.useState((s) => s.devices);
  const connectedDevice = DeviceStateStore.useState((s) => s.connectedDevice);
  const selectedChannel: number = DeviceStateStore.useState(
    (s) => s.selectedChannel
  );
  const currentPreset = DeviceStateStore.useState((s) => s.presetTone);

  const deviceScanInProgress = DeviceStateStore.useState(
    (s) => s.isDeviceScanInProgress
  );

  const requestScanForDevices = () => {
    deviceViewModel.scanForDevices();
  };

  const requestConnectDevice = (targetDeviceAddress: string = null) => {
    if (devices == null || devices?.length == 0) {
      // nothing to connect to
      return;
    }

    // if connect to target device or first known device.

    let targetDeviceInfo = null;

    if (targetDeviceAddress != null) {
      targetDeviceInfo = devices.find((d) => d.address == targetDeviceAddress);
    } else {
      targetDeviceInfo = devices[0];
    }

    if (targetDeviceInfo != null) {
      console.info("Connecting device..");
      return deviceViewModel.connectDevice(targetDeviceInfo).then((ok) => {
        setTimeout(() => {
          if (connected == true) {
            console.info("Connected, refreshing preset..");
            requestCurrentPreset();
          }
        }, 1000);
      });
    } else {
      console.warn("Target device not found..");
    }
  };

  const requestCurrentPreset = async (reconnect: boolean = false) => {
    if (reconnect) {
      //
      console.info("Reconnecting..");

      await deviceViewModel.connectDevice(connectedDevice);
    }

    deviceViewModel.requestPresetConfig().then(async (ok) => {

      await Utils.sleepAsync(500);

      console.log(
        "updating preset config in UI " +
          JSON.stringify(DeviceStateStore.getRawState().presetTone)
      );
    });


   /* deviceViewModel.requestCurrentChannelSelection().then(async () => {
      console.info("Got update channel selection info");

      //await ack then proceed
      await Utils.sleepAsync(500);

     
    });*/
  };

  const requestSetChannel = (channelNum: number) => {
    deviceViewModel.setChannel(channelNum);
  };

  const requestStoreFavourite = (includeUpload: boolean = false) => {
    //save current preset

    appViewModel.storeFavourite(currentPreset, includeUpload);
  };

  const requestStoreHardwarePreset = () => {
    console.warn("Would apply current preset to hardware channel");
  };

  const fxParamChange = (args) => {
    deviceViewModel.requestFxParamChange(args).then(() => {});
  };

  const fxToggle = (args) => {
    deviceViewModel.requestFxToggle(args).then(() => {});
  };

  // configure which state changes should cause component updates
  useEffect(() => {}, [
    connectionInProgress,
    connected,
    deviceScanInProgress,
    selectedChannel,
  ]);

  useEffect(() => {
    if (deviceViewModel) {
      deviceViewModel.addStateChangeListener(onViewModelStateChange);

      // init state
      onViewModelStateChange();
    }

    if (!connected) {
      const lastConnectedDevice = deviceViewModel.getLastConnectedDevice();

      if (lastConnectedDevice) {
        console.info(
          "Re-connecting last known device [" + lastConnectedDevice.name + "]"
        );
        requestConnectDevice(lastConnectedDevice.address);
      }
    }

    return () => {
      if (deviceViewModel) {
        deviceViewModel.removeStateChangeListener();
      }
    };
  }, []);

  return (
    <div className="amp-intro">
      <div className="row">
        <div className="col">
          <DeviceControls></DeviceControls>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <MiscControls
            deviceScanInProgress={deviceScanInProgress}
            onScanForDevices={requestScanForDevices}
            connected={connected}
            onConnect={requestConnectDevice}
            connectionInProgress={connectionInProgress}
            requestCurrentPreset={requestCurrentPreset}
            setChannel={requestSetChannel}
            devices={devices}
            selectedChannel={selectedChannel}
            onSetPreset={requestStoreHardwarePreset}
          ></MiscControls>
        </div>
      </div>
      <div className="row">
        <div aria-label="please why are you like this" className="col">
          <SignalPathControl
            signalPathState={currentPreset}
            onFxParamChange={fxParamChange}
            onFxToggle={fxToggle}
            selectedChannel={selectedChannel}
            onStoreFavourite={requestStoreFavourite}
          ></SignalPathControl>
        </div>
      </div>
    </div>
  );
};

export default DeviceMainControl;
