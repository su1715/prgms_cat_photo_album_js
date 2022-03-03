export default function Loading({ $app, initialState }) {
  this.state = initialState;
  this.$target = document.createElement("div");
  this.$target.className = "Loading Modal";

  $app.append(this.$target);

  this.setState = (nextState) => {
    this.state = nextState;
    this.render();
  };

  this.render = () => {
    this.$target.innerHTML = `<div class="content">
								  <img src="./assets/nyan-cat.gif" width="90%"/>
								</div>`;
    this.$target.style.display = this.state ? "block" : "none";
  };

  this.render();
}
