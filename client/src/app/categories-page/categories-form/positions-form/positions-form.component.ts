import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { PositionsService } from '../../../shared/services/positions.service';
import { Position } from '../../../shared/interfaces';
import { MaterialService, MaterialInstance } from '../../../shared/classes/material.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.css']
})
export class PositionsFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('modal') modalRef: ElementRef
  @Input('categoryId') categoryId: string

  positions: Position[] = [];
  loading = false;
  positionId = null;
  modal: MaterialInstance;
  form: FormGroup;

  constructor(private positionsService: PositionsService) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(0.01, [Validators.required, Validators.min(0.01)])
    });

    this.loading = true;
    this.positionsService.fetch(this.categoryId).subscribe(positions => {
      this.positions = positions;
      this.loading = false;
    });
  }

  ngAfterViewInit() {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  ngOnDestroy() {
    this.modal.destroy();
  }

  onSelectPosition(position: Position) {
    this.positionId = position._id;
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    });
    this.modal.open();
    MaterialService.updateTextInputs();
  }

  onAddPosition() {
    this.positionId = null;
    this.form.reset({
      name: null,
      cost: 0.01
    });
    this.modal.open();
    MaterialService.updateTextInputs();
  }

  onDeletePosition(event: Event, position: Position) {
    event.stopPropagation();
    const decision = confirm(`Удалить позицию ${position.name}?`);

    if (decision) {
      this.positionsService.delete(position).subscribe(
        response => {
          const idx = this.positions.findIndex(p => p._id === position._id);
          this.positions.splice(idx, 1);
          MaterialService.toast(response.message);
        },
        error => MaterialService.toast(error.error.message)
      );
    }
  }

  onCancel() {
    this.modal.close();
  }

  onSubmit() {
    this.form.disable();

    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId
    };

    const onComplete = () => {
      this.modal.close();
      this.form.reset({name: '', cost: 0.01});
      this.form.enable();
    }

    if (this.positionId) {
      newPosition._id = this.positionId;
      this.positionsService.update(newPosition).subscribe(
        position => {
          const idx = this.positions.findIndex(p => p._id === position._id);
          this.positions[idx] = position;
          MaterialService.toast('Позиция отредактирована');
        },
        error => {
          this.form.enable();
          MaterialService.toast(error.error.message);
        },
        onComplete
      );
    } else {
      this.positionsService.create(newPosition).subscribe(
        position => {
          MaterialService.toast('Позиция создана');
          this.positions.push(position);
        },
        error => {
          this.form.enable();
          MaterialService.toast(error.error.message);
        },
        onComplete
      );
    }
  }
}
