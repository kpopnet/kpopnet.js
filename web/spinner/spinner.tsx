/**
 * Simple pure CSS spinner.
 *
 * Based on https://loading.io/css/ example.
 */


interface SpinnerProps {
  center?: boolean;
  large?: boolean;
}

function Spinner({ center, large }: SpinnerProps = {}) {
  return (
    <div
      classList={{ spinner: true, spinner_centered: center, spinner_2x: large }}
    >
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
      <div class="spinner__blade" />
    </div>
  );
}

export default Spinner;
