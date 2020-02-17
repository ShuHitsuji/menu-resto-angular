import { Component, OnInit, Input, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { Comment } from '../shared/comment'
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  myDate=new Date();
  formErrors = {
    'author': '',
    'comment': ''
  };
  validationMessages = {
    'author': {
      'required':      'author is required.',
      'minlength':     'author must be at least 2 characters long.',
      'maxlength':     'author cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 2 characters long.',
      'maxlength':     'Last Name cannot be more than 100 characters long.'
    }
  };

  @ViewChild('fform') commentFormDirective;
  commentForm: FormGroup;
  commentario: Comment;

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {
      this.createForm();
    }
    

  ngOnInit() {
    
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      rating:5,
      date: [''],
      comment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)] ]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }
  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    
    this.commentario = this.commentForm.value;
    this.commentario.date=this.myDate.toString();
    this.dish.comments.push(this.commentario);
    console.log(this.commentario);
    this.commentForm.reset({
      author: '',
      rating:5,
      date:'',
      comment: ''
    });
    this.commentFormDirective.resetForm();
  }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
}
