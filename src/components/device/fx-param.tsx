import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "webaudio-knob": any;
      "webaudio-switch": any;
    }
  }
}

const FxParam = ({ type = "knob", p, fx, onFxParamChange }) => {
  let customElement;

  const setParamValue = (e) => {
    /*console.log(
      `setParamValue: Changed param ${e.target.value} ${JSON.stringify(
        e.target.tag
      )} ${fx.name} ${fx.type}`
    );*/

    onFxParamChange({
      dspId: fx.type,
      index: e.target.tag.paramId,
      value: e.target.value,
      type: type,
    });
  };

  React.useEffect(() => {
    customElement?.addEventListener("change", setParamValue);

    return () => {
      customElement?.removeEventListener("change", setParamValue);
    };
  }, []);

  React.useEffect(() => {
    var newVal = p.value ?? null;
    if (newVal != null) {
      newVal = newVal.toFixed(2);
    }
    if (customElement.value != newVal && newVal != null) {
      // an external input has changed a control value
      /* console.log(
        "Control Strip UI updated. " + customElement.value + " :: " + newVal
      );*/
      customElement?.setValue(newVal);
    }
  }, [fx, p]);

  return (
    <div key={p.paramId?.toString() ?? p.toString()}>
      {type == "knob" ? (
        <div>
          <webaudio-knob
            ref={(elem) => {
              customElement = elem;
              if (customElement) customElement.tag = p;
            }}
            // src="./lib/webaudio-controls/knobs/LittlePhatty.png"
            min="0"
            value={Math.round(p.value*100)/100}
            max="1"
            step="0.1"
            diameter="64"
            tooltip={p.name + " %s"}
            aria-label = {p.name + " is at " + Math.round(p.value*100)/100}
            // tabindex='0'
          ></webaudio-knob>
          <label>{p.name}</label>
        </div>
      ) : (
        <div>
          <webaudio-switch
            ref={(elem) => {
              customElement = elem;
              if (customElement) customElement.tag = p;
            }}
            src="./lib/webaudio-controls/knobs/switch_toggle.png"
            value={fx.enabled == true ? "1" : "0"}
            aria-label = {p.name + " is " + (fx.enabled == true ? "enabled" : "disabled")}
          ></webaudio-switch>
        </div>
      )}
    </div>
  );
};

export default FxParam;
