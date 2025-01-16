import mongoose from 'mongoose';

const captainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['regular', 'piano'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }
});

const jamSongSchema = new mongoose.Schema({
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  played: {
    type: Boolean,
    default: false
  },
  captains: [captainSchema]
});

const jamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  jamDate: {
    type: Date,
    required: true
  },
  songs: [jamSongSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Jam || mongoose.model('Jam', jamSchema); 