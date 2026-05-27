<script lang="ts">
  const time = "12:34"
  const label = "Work 2/4"
</script>

<div class="container" data-tauri-drag-region>
  <div class="time">{time}</div>
  <div class="label">{label}</div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #1a1a1a;
    color: #ffffff;
    user-select: none;
  }

  .time {
    font-size: 32px;
    font-family: monospace;
    font-weight: bold;
    line-height: 1.1;
  }

  .label {
    font-size: 14px;
    font-family: sans-serif;
    opacity: 0.7;
  }
</style>
