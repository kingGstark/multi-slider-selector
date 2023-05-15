import { Component, ElementRef, VERSION } from '@angular/core';
import * as _ from 'lodash';
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  sliderTrack: any;
  minGap = 0;
  stripes = new Array(9);
  round: boolean = false;
  riskBands = [
    { name: 'low', color: 'green', numericValue: 1 },
    { name: 'medium-low', color: '#ece646', numericValue: 4 },
    { name: 'medium', color: 'orange', numericValue: 5 },
    { name: 'high', color: 'red', numericValue: 11 },
    { name: 'xtreme', color: '#850e0e', numericValue: 16 },
  ];
  copy = [...this.riskBands];
  deepCopy = _.cloneDeep(
    this.riskBands.map((el) => {
      return { ...el, prev: el.numericValue };
    })
  );
  background: string;
  showBands: any[];
  range = '';
  minRange = '0';
  showMaxRange: any;
  maxRange: any;
  snapshot = _.cloneDeep([...this.riskBands]);
  ngOnInit() {
    this.maxRange = this.showMaxRange = Math.max(
      ...this.riskBands.map((el) => el.numericValue)
    );
    this.sliderTrack = document.querySelector('.slider-track') as HTMLElement;
    this.fillColor();
    this.copy.pop();
    this.changeRound();
  }

  fillColor(ref?: HTMLInputElement, event?) {
    let background = 'linear-gradient(to right,';
    this.range = '';
    let right: boolean;

    if (ref) {
      this.deepCopy[ref.id].numericValue = Number(ref.value);
      console.log(
        this.deepCopy[ref.id].numericValue - this.deepCopy[ref.id].prev,
        this.deepCopy[ref.id].numericValue,
        this.deepCopy[ref.id].prev
      );
      if (this.deepCopy[ref.id].numericValue - this.deepCopy[ref.id].prev > 0) {
        this.deepCopy[ref.id].prev = this.deepCopy[ref.id].numericValue;
        right = true;
      } else {
        this.deepCopy[ref.id].prev = this.deepCopy[ref.id].numericValue;
        right = false;
      }

      this.checkPosition(right, ref);
    }

    this.updateColor();
    this.changeRound();
  }

  updateColor() {
    this.background = 'linear-gradient(to right,';
    this.riskBands.forEach((el, i, e) => {
      if (e[i - 1] == undefined) {
        this.background += `${el.color} 0%, ${el.color} ${
          (el.numericValue / this.maxRange) * 100
        }%,`;
        this.range += ` ${el.color} ${el.numericValue},`;
      } else {
        this.background +=
          i + 1 !== this.riskBands.length
            ? `
      ${el.color} ${(e[i - 1].numericValue / this.maxRange) * 100}%, ${
                el.color
              } ${(el.numericValue / this.maxRange) * 100}%,`
            : `${el.color} ${(e[i - 1].numericValue / this.maxRange) * 100}%, ${
                el.color
              } ${(el.numericValue / this.maxRange) * 100}%)`;

        this.range +=
          i + 1 !== this.riskBands.length
            ? `
      ${el.color} ${el.numericValue},`
            : `${el.color} ${el.numericValue})`;
      }
    });
    this.sliderTrack.style.background = this.background;
  }

  changeRound() {
    this.showBands = [...this.riskBands];
    if (this.round) {
      this.showBands = this.showBands.map((el) => {
        return {
          ...el,
          numericValue: `${el.numericValue}.99`,
        };
      });
      this.minRange = '0.00';
      this.showMaxRange = `${this.maxRange}.00`;
    } else {
      this.showBands.forEach((el) => (el.numericValue = `${el.numericValue}`));
      this.minRange = '0';
      this.showMaxRange = this.maxRange;
    }
  }

  checkPosition(right, ref: HTMLInputElement) {
    if (right) {
      this.copy.forEach((el, i, e) => {
        const prev = e[i - 1];
        const next = e[i + 1];

        if (next) {
          if (
            Number(el.numericValue) - Number(next.numericValue) ==
            this.minGap
          ) {
            next.numericValue = Number(next.numericValue) + 1;
            this.deepCopy[i + 1].numericValue =
              this.deepCopy[i + 1].numericValue + 1;
            this.deepCopy[i + 1].prev = this.deepCopy[i + 1].prev + 1;
          }
        }
      });
    } else {
      let i = Number(ref?.id);
      while (i > 0) {
        const prev = this.copy[i - 1];
        const current = this.copy[i];

        if (prev) {
          if (prev.numericValue - current.numericValue == this.minGap) {
            prev.numericValue = prev.numericValue - 1;
            this.deepCopy[i - 1].numericValue =
              this.deepCopy[i - 1].numericValue - 1;
            this.deepCopy[i - 1].prev = this.deepCopy[i - 1].prev - 1;
          }
        }
        i--;
      }
    }
  }

  checkValidation() {
    let overlap = false;
    this.riskBands.forEach((current, index, array) => {
      const prev = array[index - 1];
      const next = array[index + 1];

      if (prev) {
        console.log(current);
        current.numericValue - prev.numericValue <= 0 ? (overlap = true) : '';
      }
      if (next) {
        next.numericValue - current.numericValue <= 0 ? (overlap = true) : '';
      }
      if (current.numericValue == 0) {
        overlap = true;
      }
    });

    if (!overlap) {
      this.snapshot = _.cloneDeep([...this.riskBands]);
    } else {
      console.log(this.snapshot);
      this.riskBands = [...this.snapshot];
      let copy = [...this.snapshot];
      copy.pop();
      this.copy = copy;
      this.snapshot = _.cloneDeep([...this.riskBands]);
      this.changeRound();
      this.updateColor();
    }
  }
}
